from rest_framework import generics, status, viewsets, filters
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from django.contrib.auth import authenticate
import jwt
from django.http import JsonResponse
import uuid
from django.db.models import Sum, Min, F, OuterRef, Subquery, Count
from rest_framework.decorators import api_view
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import Member, Account, Loan, PaymentSchedule, Payment, Ledger
from .serializers import (
    MemberSerializer, AccountSerializer, LoanSerializer, 
    PaymentScheduleSerializer, PaymentSerializer,LedgerSerializer, MemberTokenSerializer
)
from uuid import UUID
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework import serializers
from rest_framework.views import APIView
from .models import SystemSettings
from .serializers import SystemSettingsSerializer
import logging

logger = logging.getLogger(__name__)
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Archive
from .serializers import ArchiveSerializer
from .models import AuditLog  # Assuming you have an AuditLog model
from .serializers import AuditLogSerializer
class ArchiveViewSet(viewsets.ModelViewSet):
    serializer_class = ArchiveSerializer

    def get_queryset(self):
        # Filter the queryset based on the type of archive (users or loans)
        archive_type = self.request.query_params.get('archive_type', None)
        if archive_type:
            return Archive.objects.filter(archive_type=archive_type)
        return Archive.objects.all()

class SystemSettingsView(APIView):
    def get(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data, status=200)

    def put(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

    def post(self, request):
        serializer = SystemSettingsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class RegisterMemberView(generics.CreateAPIView):
    def post(self, request, *args, **kwargs):
        account_number = request.data.get('account_number')
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            account = Account.objects.get(account_number=account_number)
            if account.account_holder.email != email:
                return Response({"error": "Email does not match records"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=account_number, email=email, password=password)
            account.account_holder.user = user
            account.account_holder.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except Account.DoesNotExist:
            return Response({"error": "Invalid account number."}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
def member_login(request):
    account_number = request.data.get('account_number')
    password = request.data.get('password')
    
    print(f"DEBUG: Received data - account_number={account_number}, password={password}")

    if not account_number or not password:
        return Response({'detail': 'Account number and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    member = authenticate(username=account_number, password=password)
    if member is not None and hasattr(member, 'member_profile'):
        from rest_framework_simplejwt.tokens import RefreshToken
        tokens = RefreshToken.for_user(member)

        member_profile = member.member_profile
        account_number = getattr(member_profile.accountN, 'account_number', None)
        print(f"DEBUG: Retrieved account_number={account_number}")

        if not account_number:
            return Response({'detail': 'Account information is missing or invalid'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'access': str(tokens.access_token),
            'refresh': str(tokens),
            'account_number': account_number,
            'user_id': member.id,
            'email': member.email,
        }, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)





    
class MemberLoginView(TokenObtainPairView):
    serializer_class = MemberTokenSerializer
class AdminLoginView(TokenObtainPairView):
    pass  


class LogoutView(APIView):
    def post(self, request):
        try:
            token = request.data.get("refresh")
            token_obj = RefreshToken(token)
            token_obj.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MemberProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            member = Member.objects.get(user=request.user)
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)
        
class MemberFilter(django_filters.FilterSet):
    account_number = django_filters.CharFilter(field_name='accountN__account_number', lookup_expr='exact')

    class Meta:
        model = Member
        fields = ['account_number']  

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = MemberFilter  
    search_fields = ['accountN__account_number']  


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [AllowAny]

    def _handle_transaction(self, account, amount, transaction_type):
        try:
            amount = Decimal(amount)
            if amount <= 0:
                return Response({"error": "Amount must be a positive value."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({"error": "Invalid amount format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if transaction_type == 'deposit':
                account.deposit(amount)
                message = "Deposit successful!"
            elif transaction_type == 'withdraw':
                account.withdraw(amount)
                message = "Withdrawal successful!"
            else:
                return Response({"error": "Invalid transaction type."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": message, "new_balance": account.shareCapital}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='deposit')
    def deposit(self, request, pk=None):
        account = self.get_object()
        amount = request.data.get('amount')
        return self._handle_transaction(account, amount, 'deposit')

    @action(detail=True, methods=['post'], url_path='withdraw')
    def withdraw(self, request, pk=None):
        account = self.get_object()
        amount = request.data.get('amount')
        return self._handle_transaction(account, amount, 'withdraw')


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        loan = self.get_object()
        loan.mark_as_paid()
        return Response({'status': 'loan marked as paid'})

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        loan = self.get_object()
        loan.archive()
        return Response({'status': 'loan archived'})

    def get_queryset(self):
        
        control_number = self.request.query_params.get('control_number', None)
        if control_number:
            try:
                uuid.UUID(control_number)
            except ValueError:
                return Loan.objects.none() 
            return Loan.objects.filter(control_number=control_number)
        return super().get_queryset()
    @action(detail=False, methods=['post'])
    def create_loan(self, request):
        account_number = request.data.get('account_number')
        try:
            account = Account.objects.get(account_number=account_number)
        except Account.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_404_NOT_FOUND)

        active_loan = Loan.objects.filter(account=account).first()
        if active_loan and not active_loan.check_loan_eligibility_for_reloan():
            return Response({
                "error": "50% of the existing loan must be paid off before applying for a new loan."
            }, status=status.HTTP_400_BAD_REQUEST)

        loan_data = request.data
        loan_data['service_fee'] = None 

        try:
            with transaction.atomic():
                new_loan = Loan.objects.create(**loan_data)
                new_loan.calculate_service_fee() 
                new_loan.takehomePay = new_loan.loan_amount - new_loan.service_fee
                new_loan.save()  
                
                self.create_payment_schedule(new_loan)  
                
                return Response({
                    "status": "Loan created successfully",
                    "control_number": new_loan.control_number
                }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error creating loan: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


        
    def create_payment_schedule(self, loan):
        
        loan_amount = loan.loan_amount
        loan_period = loan.loan_period

        
        installment_amount = loan_amount / loan_period

        for month in range(loan_period):
            PaymentSchedule.objects.create(
                loan=loan,
                due_date=timezone.now() + timezone.timedelta(days=(month * 30)),  
                balance=installment_amount,
                installment_amount=installment_amount,
                status='Pending'
            )

    @action(detail=True, methods=['get'])
    def payment_schedule(self, request, pk=None):
        loan = self.get_object()
        payment_schedule = PaymentSchedule.objects.filter(loan=loan)
        return Response(PaymentScheduleSerializer(payment_schedule, many=True).data)
    def create(self, request, *args, **kwargs):
        """
        Override create to calculate service fee and other fields if needed.
        """
        loan_data = request.data
        loan_amount = float(loan_data.get('loan_amount', 0))
        loan_period = int(loan_data.get('loan_period', 0))
        
        
        if loan_period <= 12:
            service_fee = loan_amount * 0.01
        elif loan_period <= 24:
            service_fee = loan_amount * 0.015
        elif loan_period <= 36:
            service_fee = loan_amount * 0.02
        else:
            service_fee = loan_amount * 0.025
        
        loan_data['service_fee'] = service_fee
        takehomePay = loan_amount - service_fee
        loan_data['takehomePay'] = takehomePay
        serializer = self.get_serializer(data=loan_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @action(detail=False, methods=['get'])
    def by_account(self, request):
        # Extract the account number from query parameters
        account_number = request.query_params.get('account_number', None)
        
        if not account_number:
            return Response({"detail": "Account number not provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Log the received account number for debugging
        print(f"[DEBUG] Account number received: {account_number}")
        
        # Query loans associated with the account number
        try:
            loans = Loan.objects.filter(account__account_number=account_number)
            print(f"[DEBUG] Found {loans.count()} loans for account number: {account_number}")

            # Serialize the data
            serializer = LoanSerializer(loans, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Log and return any unexpected errors
            print(f"[ERROR] Error fetching loans for account number {account_number}: {str(e)}")
            return Response(
                {"detail": "An error occurred while fetching loans."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
class PaymentScheduleViewSet(viewsets.ModelViewSet):
    queryset = PaymentSchedule.objects.all()
    serializer_class = PaymentScheduleSerializer

    @action(detail=False, methods=['get'], url_path='summaries')
    def payment_schedule_summaries(self, request):
        loan_type = request.query_params.get('loan_type', None)
        earliest_due_date = PaymentSchedule.objects.filter(
            loan__account=OuterRef('loan__account'),
            is_paid=False
        ).values('due_date').order_by('due_date')[:1]
        
        summaries = PaymentSchedule.objects.filter(
            is_paid=False,
            due_date=Subquery(earliest_due_date)
        )

        if loan_type:  # Filter by loan_type if provided (Regular or Emergency)
            summaries = summaries.filter(loan__loan_type=loan_type)

        summaries = summaries.annotate(
            account_number=F('loan__account__account_number'),
            next_due_date=F('due_date'),
            total_balance=Sum('balance'),
            loan_type_annotated=F('loan__loan_type')  # No need to specify source here
        ).values('account_number', 'next_due_date', 'total_balance', 'loan_type_annotated').distinct()

        return Response(summaries)

    @action(detail=True, methods=['get'])
    def loan_details(self, request, pk=None):
        schedule = self.get_object()
        loan = schedule.loan
        return Response(LoanSerializer(loan).data)


    def get_queryset(self):
        account_number = self.request.query_params.get('account_number')
        loan_type = self.request.query_params.get('loan_type', None)

        queryset = self.queryset

        if account_number:
            queryset = queryset.filter(loan__account__account_number=account_number)

        if loan_type:
            queryset = queryset.filter(loan__loan_type=loan_type)

        return queryset


    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        schedule = self.get_object()

        # Mark the payment schedule as paid
        schedule.is_paid = True
        schedule.status = 'Paid'
        schedule.save()

        # Now check if all payment schedules are paid
        update_loan_status(schedule.loan)

        return Response({'status': 'Payment marked as paid.'}, status=status.HTTP_200_OK)

def mark_as_paid(request, id):
            try:
                schedule = PaymentSchedule.objects.get(id=id)

                schedule.is_paid = True
                schedule.status = 'Paid'
                schedule.save()

                return JsonResponse({'status': 'Payment marked as paid.'}, status=status.HTTP_200_OK)
            except PaymentSchedule.DoesNotExist:
                return JsonResponse({'error': 'Payment schedule not found.'}, status=status.HTTP_404_NOT_FOUND)
from django.db.models import Q

def update_loan_status(loan):
    # Check if all payment schedules are marked as paid
    all_paid = loan.paymentschedule_set.filter(is_paid=False).count() == 0

    if all_paid:
        loan.status = 'Paid-off'  # or 'Paid-off'
        loan.save()

        # Optionally, archive the loan (you can add a separate 'archived' field or flag)
        loan.archived = True  # Assuming you have an archived field
        loan.save()

    else:
        loan.status = 'Pending'
        loan.save()

    
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
       

       
        schedule = PaymentSchedule.objects.get(id=request.data['schedule_id'])
        if schedule:
            schedule.is_paid = True
            schedule.status = 'Paid'
            schedule.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_payments(request, control_number):
    try:
        control_number_uuid = UUID(control_number)  

        # Log the control_number_uuid to check if it's correct
        logger.info(f"Fetching payments for Loan with Control Number: {control_number_uuid}")

        loan = Loan.objects.get(control_number=control_number_uuid)

        # Ensure the loan is associated with the logged-in member's account
        if loan.account.account_holder.user != request.user:
            return Response({"error": "You do not have permission to view payments for this loan."}, status=status.HTTP_403_FORBIDDEN)

        payments = Payment.objects.filter(payment_schedule__loan=loan)
        if payments.exists():
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No payments found for this loan."}, status=status.HTTP_404_NOT_FOUND)
    
    except Loan.DoesNotExist:
        return Response({"error": "Loan not found."}, status=status.HTTP_404_NOT_FOUND)
    
    except ValueError:
        return Response({"error": "Invalid UUID format."}, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        # Log the exception for debugging
        logger.error(f"Error fetching payments: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class ActiveLoansByAccountView(APIView):
    def get(self, request, account_number):
        loans = Loan.objects.filter(account__account_number=account_number)
        print(f"Loans found: {loans}")

        active_loans_data = []
        payment_schedules_data = []

        for loan in loans:
            schedules = PaymentSchedule.objects.filter(loan=loan)
            active = False
            schedule_data = []
            for schedule in schedules:
                if not schedule.is_paid:
                    active = True
                    schedule_data.append(PaymentScheduleSerializer(schedule).data)

            if active:
                active_loans_data.append(LoanSerializer(loan).data)
                payment_schedules_data.append(schedule_data)

        if active_loans_data:
            return Response({
                'active_loans': active_loans_data,
                'payment_schedules': payment_schedules_data
            })
        else:
            return Response({"message": "No active loans found."}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
def payment_schedules_by_loan(request, loan_control_number):
    try:
        payment_schedules = PaymentSchedule.objects.filter(loan__control_number=loan_control_number)
        serializer = PaymentScheduleSerializer(payment_schedules, many=True)
        return Response(serializer.data)
    except PaymentSchedule.DoesNotExist:
        return Response({"error": "Payment schedules not found for this loan"}, status=404)
       


class MemberLoanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        member = request.user.member
        loans = Loan.objects.filter(account__account_holder=member)
        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PaymentListView(APIView):
    def get(self, request, loan_id, format=None):
        
        try:
            loan = Loan.objects.get(control_number=loan_id)
            payments = Payment.objects.filter(loan=loan)
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except Loan.DoesNotExist:
            return Response({"error": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

class AccountDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        account = Account.objects.filter(account_holder=request.user).first()
        
        if not account:
            return Response({"detail": "Account not found."}, status=404)
        
        
        account_serializer = AccountSerializer(account)
        
       
        transactions = Ledger.objects.filter(account_number=account)
        ledger_serializer = LedgerSerializer(transactions, many=True)

        return Response({
            "account": account_serializer.data,
            "transactions": ledger_serializer.data
        })


class LoanSummaryView(APIView):
    def get(self, request):
        
        active_borrowers = Loan.objects.filter(status='Ongoing').values('member').distinct().count()
        paid_off_borrowers = Loan.objects.filter(status='Paid-off').values('member').distinct().count()

        
        total_received = Loan.objects.aggregate(Sum('loan_amount'))['loan_amount__sum'] or 0
        total_returned = Payment.objects.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        service_fees = Loan.objects.aggregate(Sum('service_fee'))['service_fee__sum'] or 0
        penalties = Loan.objects.aggregate(Sum('penalty_fee'))['penalty_fee__sum'] or 0
        profit = (total_received - total_returned) + service_fees + penalties

        
        ongoing_loans = Loan.objects.filter(status='Ongoing').count()
        completed_loans = Loan.objects.filter(status='Paid-off').count()
        pending_loans = Loan.objects.filter(status='Pending').count()

        
        total_payment_schedules = PaymentSchedule.objects.aggregate(Sum('amount_due'))['amount_due__sum'] or 0

        
        total_loans_count = Loan.objects.count()
        total_payments_count = Payment.objects.count()
        
        data = {
            'borrowers': {
                'active': active_borrowers,
                'paidOff': paid_off_borrowers,
            },
            'netTotalLoan': {
                'received': total_received,
                'returned': total_returned,
                'profit': profit,
                'serviceFees': service_fees,
                'penalties': penalties,
            },
            'loans': {
                'ongoing': ongoing_loans,
                'completed': completed_loans,
                'pending': pending_loans,
            },
            'paymentSchedules': total_payment_schedules,
            'totalLoansCount': total_loans_count,
            'totalPaymentsCount': total_payments_count,
        }

        return Response(data)

from django.http import JsonResponse
from .models import Loan
from django.db.models import Sum

from django.db.models import Sum
from django.http import JsonResponse
from .models import Loan

def loan_summary(request):
    # Count borrowers (distinct members with loans)
    active_borrowers = Loan.objects.filter(status='Pending').values('account__account_number').distinct().count()
    paid_off_borrowers = Loan.objects.filter(status='Paid-off').values('account__account_number').distinct().count()

    # Net total loan amount
    total_net_loan = Loan.objects.aggregate(
        total_loan=Sum('loan_amount')
    )['total_loan'] or 0  # Default to 0 if no loans

    # Count loans by status
    ongoing_loans = Loan.objects.filter(status='Pending').count()
    completed_loans = Loan.objects.filter(status='Paid-off').count()

    # Prepare the response data
    data = {
        'borrowers': {
            'active': active_borrowers,
            'paidOff': paid_off_borrowers
        },
        'netTotalLoan': {
            'returned': total_net_loan,  # If you need separate calculation, adjust accordingly
            'profit': 0  # Add your profit calculation logic here if necessary
        },
        'loans': {
            'ongoing': ongoing_loans,
            'completed': completed_loans,
            'pending': ongoing_loans  # Pending loans are ongoing by default
        }
    }

    return JsonResponse(data)



class AccountTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_number):
        try:
            
            account = Account.objects.get(account_number=account_number)

            if request.user.is_staff:
                transactions = Ledger.objects.filter(account_number=account).order_by('-timestamp')
            elif request.user == account.account_holder.user:
                transactions = Ledger.objects.filter(account_number=account).order_by('-timestamp')
            else:
                return Response({'error': 'You do not have permission to view this ledger.'}, status=status.HTTP_403_FORBIDDEN)

            serializer = LedgerSerializer(transactions, many=True)
            return Response({'transactions': serializer.data})

        except Account.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:  
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all()
        data = [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]
        return Response(data)

class ResetPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:  
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=pk)
            new_password = request.data.get('password')
            if not new_password:
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            user.password = make_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer

class MemberPaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Access the Member profile associated with the authenticated user
            member = request.user.member_profile
            # Get the Account linked to the Member
            account = member.accountN
            # Get the account number
            account_number = account.account_number

            # Fetch payments related to the account number and check for 'Paid' status in Loan
            payments = Payment.objects.filter(
                payment_schedule__loan__account__account_number=account_number,
                payment_schedule__loan__status="Paid"  # Correctly check status in Loan model
            ).select_related('payment_schedule', 'payment_schedule__loan')

            # Serialize the payments and return the response
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)

        except AttributeError:
            # Handle case where the user doesn't have a linked Member profile or Account
            return Response({'error': 'User does not have an associated member profile or account.'}, status=400)



# @api_view(['GET'])
# def get_payments_by_schedule(request, schedule_id):
#     try:
#         # Fetch the PaymentSchedule by ID
#         payment_schedule = PaymentSchedule.objects.get(id=schedule_id)

#         # Fetch all payments linked to this PaymentSchedule
#         payments = Payment.objects.filter(payment_schedule=payment_schedule)

#         if payments.exists():
#             # Serialize the payments data and send the response
#             serializer = PaymentSerializer(payments, many=True)
#             return Response(serializer.data)
#         else:
#             return Response({"error": "No payments found for this schedule."}, status=status.HTTP_404_NOT_FOUND)
    
#     except PaymentSchedule.DoesNotExist:
#         return Response({"error": "Payment schedule not found."}, status=status.HTTP_404_NOT_FOUND)
# @api_view(['GET'])
# def get_payments_by_schedule(request, schedule_id):
#     try:
#         # Fetch the payment schedule by ID
#         payment_schedule = PaymentSchedule.objects.get(id=schedule_id)
        
#         # Get all payments associated with this schedule
#         payments = Payment.objects.filter(payment_schedule=payment_schedule)
        
#         if payments.exists():
#             serializer = PaymentSerializer(payments, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "No payments found for this payment schedule."}, status=status.HTTP_404_NOT_FOUND)
#     except PaymentSchedule.DoesNotExist:
#         return Response({"error": "Payment schedule not found."}, status=status.HTTP_404_NOT_FOUND)
class PaymentListByScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_schedule_id, *args, **kwargs):
        try:
            # Get the logged-in user's account
            user_account = request.user.account

            # Get the PaymentSchedule by its ID
            payment_schedule = PaymentSchedule.objects.get(id=payment_schedule_id)

            # Check if the PaymentSchedule belongs to the logged-in user's loan
            if payment_schedule.loan.account != user_account:
                return Response({"detail": "You do not have permission to view these payments."}, status=status.HTTP_403_FORBIDDEN)

            # If the user is authorized, fetch the payments associated with the schedule
            payments = Payment.objects.filter(payment_schedule=payment_schedule)
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except PaymentSchedule.DoesNotExist:
            return Response({"detail": "Payment schedule not found."}, status=status.HTTP_404_NOT_FOUND)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
def get_payments_by_schedule(request, paymentScheduleId):
    try:
        # Get the payments associated with the given paymentScheduleId
        payments = Payment.objects.filter(payment_schedule_id=paymentScheduleId)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    except PaymentSchedule.DoesNotExist:
        return Response({"error": "Payment schedule not found"}, status=status.HTTP_404_NOT_FOUND)
    

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Payment

class PaymentsByAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Extract the account_number from query params
        account_number = request.query_params.get('account_number', None)
        
        if not account_number:
            return Response({"error": "Account number is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the member related to the logged-in user
            user = request.user
            member = user.member_profile  # Ensure the correct relationship
            if not member:
                return Response({"error": "No member found for this user."}, status=status.HTTP_404_NOT_FOUND)

            # Get the account associated with the member
            account = member.account  # Adjust if necessary
            if not account:
                return Response({"error": "No account found for this member."}, status=status.HTTP_404_NOT_FOUND)

            if account.account_number != account_number:
                return Response({"error": "Account number does not match member's account."}, status=status.HTTP_400_BAD_REQUEST)

            # Filter payments based on the account number
            payments = Payment.objects.filter(payment_schedule__loan__account__account_number=account_number)
            
            # If no payments found
            if not payments.exists():
                return Response({"error": "No payments found for this account."}, status=status.HTTP_404_NOT_FOUND)

            # Serialize the payments and return the data
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except AttributeError:
            return Response({"error": "Account or Member not found for this user."}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AuditTrailView(APIView):
    def get(self, request):
        logs = AuditLog.objects.all()
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)