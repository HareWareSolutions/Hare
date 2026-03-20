import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import Any, Annotated

from app.api.deps import SessionDep, CurrentUser
from app.core.config import settings
from app.models.company import Company

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

@router.post("/create-checkout")
def create_checkout_session(
    db: SessionDep,
    current_user: CurrentUser,
    plan_id: str,
) -> Any:
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=company.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': plan_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{settings.FRONTEND_URL}/dashboard/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/dashboard/billing/cancel",
            client_reference_id=str(company.id)
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: SessionDep, stripe_signature: Annotated[str | None, Header()] = None) -> Any:
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Log the event type for debugging
    print(f"Webhook event: {event['type']}")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        company_id = session.get('client_reference_id')
        if company_id:
            company = db.query(Company).filter(Company.id == company_id).first()
            if company:
                company.stripe_customer_id = session.get('customer')
                company.stripe_subscription_id = session.get('subscription')
                company.subscription_status = "active"
                db.add(company)
                db.commit()
                
    elif event['type'] in ['customer.subscription.updated', 'customer.subscription.deleted']:
        subscription = event['data']['object']
        stripe_sub_id = subscription.get('id')
        status = subscription.get('status') # active, past_due, canceled, trialing
        
        company = db.query(Company).filter(Company.stripe_subscription_id == stripe_sub_id).first()
        if company:
            company.subscription_status = status
            db.add(company)
            db.commit()

    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        stripe_sub_id = invoice.get('subscription')
        if stripe_sub_id:
            company = db.query(Company).filter(Company.stripe_subscription_id == stripe_sub_id).first()
            if company:
                company.subscription_status = "past_due"
                db.add(company)
                db.commit()

    return {"status": "success"}
