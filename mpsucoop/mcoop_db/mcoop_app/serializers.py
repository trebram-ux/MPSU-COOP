from rest_framework import serializers
from django.contrib.auth.models import User
from decimal import Decimal
from .models import Member, Account, Loan, PaymentSchedule, Payment,Ledger,SystemSettings
from django.contrib.auth import authenticate
import uuid
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Archive
from rest_framework import serializers
from datetime import date, datetime

from rest_framework import serializers
from datetime import date, datetime

class ArchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Archive
        fields = ['id', 'archive_type', 'archived_data', 'archived_at']

    def validate_archived_data(self, value):
        # Perform custom validation logic for archived data
        if not isinstance(value, dict):
            raise serializers.ValidationError("Archived data must be a valid dictionary.")
        
        # Ensure any date fields are converted to string in the data
        for key, val in value.items():
            if isinstance(val, (date, datetime)):
                value[key] = val.strftime('%Y-%m-%d')  # Convert date or datetime to string
        return value

    def to_representation(self, instance):
        # Convert any date fields to string during serialization
        representation = super().to_representation(instance)
        
        # Iterate through archived_data and convert date fields to string
        if 'archived_data' in representation:
            archived_data = representation['archived_data']
            for key, value in archived_data.items():
                if isinstance(value, (date, datetime)):
                    archived_data[key] = value.strftime('%Y-%m-%d')  # Customize format as needed
        return representation



class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class MemberTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_account = attrs.get("username") or attrs.get("account_number")
        password = attrs.get("password")
        
        # Authenticate user
        user = authenticate(username=username_or_account, password=password)
        if user and hasattr(user, 'member_profile'):
            data = super().validate(attrs)
            
            # Access the member profile
            member = user.member_profile
            print(f"DEBUG: Member profile: {member}")

            # Verify accountN and account_number
            accountN = getattr(member, 'accountN', None)
            if not accountN or not accountN.account_number:
                print("DEBUG: Account information is missing or invalid.")
                raise serializers.ValidationError("Account information is missing or invalid.")
            
            # Add custom fields to the response
            data.update({
                'user_id': user.id,
                'account_number': accountN.account_number,
                'email': user.email,
            })
            print(f"DEBUG: Serialized data: {data}")
            return data
        
        raise serializers.ValidationError("Invalid member credentials.")





class MemberSerializer(serializers.ModelSerializer):
    accountN = serializers.CharField(source='accountN.account_number', read_only=True)
    share_capital = serializers.DecimalField(source='accountN.shareCapital', max_digits=15, decimal_places=2, read_only=True)
    # password = serializers.CharField(write_only=True)
    user = UserSerializer(read_only=True) 

    class Meta:
        model = Member
        fields = ['memId','accountN','share_capital',  'first_name', 'middle_name', 'last_name', 'email', 'phone_number', "birth_date", 'gender','religion', 'pstatus', 'address','user']


    def get_accountN(self, obj):
        return obj.accountN.account_number if hasattr(obj, 'accountN') else None
    


    def create(self, validated_data):
        account_data = validated_data.pop('accountN', None)
        member = Member.objects.create(**validated_data)

        if account_data:
            Account.objects.create(account_holder=member, **account_data)
        
        return member
class AccountSerializer(serializers.ModelSerializer):
    account_holder = MemberSerializer(read_only=True)
    class Meta:
        model = Account
        fields = ['account_number', 'account_holder', 'shareCapital', 'status', 'created_at', 'updated_at']
class PaymentScheduleSerializer(serializers.ModelSerializer):
    loan_type = serializers.CharField(source='loan_type_annotated', read_only=True)  # Ibigay ang loan_type mula sa annotated field

    class Meta:
        model = PaymentSchedule
        fields = ['id', 'loan', 'principal_amount', 'interest_amount', 'payment_amount', 
                  'due_date', 'balance', 'is_paid', 'service_fee_component', 'loan_type']

class LoanSerializer(serializers.ModelSerializer):
    control_number = serializers.ReadOnlyField()
    bi_monthly_installment = serializers.SerializerMethodField()
    payment_schedule = PaymentScheduleSerializer(source='paymentschedule_set', many=True, read_only=True)

    class Meta:
        model = Loan
        fields = ['control_number', 'account', 'loan_amount', 'loan_type', 'interest_rate', 
                  'loan_period', 'loan_period_unit', 'loan_date', 'due_date', 'status', 'takehomePay',
                  'service_fee','penalty_rate', 'purpose', 'bi_monthly_installment', 'payment_schedule']
        read_only_fields = ['control_number', 'loan_date', 'due_date', 'interest_rate',  'penalty_rate']
    def validate_control_number(self, value):
        try:
            uuid.UUID(str(value))
        except ValueError:
            raise serializers.ValidationError("Invalid UUID format.")
        return value
    def get_bi_monthly_installment(self, obj):
        total_periods = (obj.loan_period * 2) if obj.loan_period_unit == 'years' else obj.loan_period * 2
        bi_monthly_rate = (obj.interest_rate / Decimal('100')) / 24  
        total_interest = (obj.loan_amount * bi_monthly_rate * total_periods)
        total_amount_due = obj.loan_amount + total_interest
        bi_monthly_payment = total_amount_due / Decimal(total_periods)
        return bi_monthly_payment.quantize(Decimal('0.01'))

    def create(self, validated_data):
        loan = Loan.objects.create(**validated_data)
        if loan.status == 'Pending':
            loan.generate_payment_schedule()
        return loan



class PaymentSerializer(serializers.ModelSerializer):
        class Meta:
            model = Payment
            fields = '__all__'
            
        def to_representation(self, instance):
            data = super().to_representation(instance)
            data['control_number'] = str(instance.control_number)
            return data
class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'

