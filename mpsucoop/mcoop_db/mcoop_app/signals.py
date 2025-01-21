from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime
from django.db.models import Max
from .models import Member, Account, Loan, Payment, PaymentSchedule
import uuid
from decimal import Decimal

@receiver(post_save, sender=Member)
def create_account_for_member(sender, instance, created, **kwargs):
    if created:
        current_year = datetime.now().year
        current_day = datetime.now().day
        year_suffix = str(current_year)[-2:]  
        day_suffix = str(current_day).zfill(2)  
        
        
        prefix = f"{year_suffix}{day_suffix}"

        last_account = Account.objects.filter(account_number__startswith=prefix).aggregate(Max('account_number'))

        last_account_number = last_account['account_number__max']
        if last_account_number:
            increment = int(last_account_number.split('-')[1]) + 1
        else:
            increment = 1

        incremental_part = str(increment).zfill(4)

        account_number = f"{prefix}-{incremental_part}"

        Account.objects.create(
            account_number=account_number,
            account_holder=instance,
            shareCapital=Decimal('0.00'),
            status='Active'
        )
@receiver(post_save, sender=Loan)
def handle_loan_post_save(sender, instance, created, **kwargs):
    if created and instance.status == 'Ongoing':
        if not instance.due_date:
            instance.generate_payment_schedule()


@receiver(post_save, sender=Payment)
def update_payment_and_loan_status(sender, instance, created, **kwargs):
    if created:
        
        payment_schedule = instance.payment_schedule
        if payment_schedule:
            payment_schedule.balance -= instance.amount
            payment_schedule.is_paid = payment_schedule.balance <= 0
            payment_schedule.save()

        
        loan = payment_schedule.loan
        if loan.payment_schedules.filter(is_paid=False).count() == 0:
            loan.status = 'Paid'
            loan.save()

        
        instance.description = f"Payment of {instance.amount} recorded on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
        instance.transaction_type = "Payment"  
        instance.save(update_fields=['description', 'transaction_type'])

        
        send_mail(
            subject='Payment Confirmation',
            message=f'Thank you! Your payment of {instance.amount} has been received.',
            from_email='noreply@yourdomain.com',
            recipient_list=[loan.account.account_holder.email],
        )