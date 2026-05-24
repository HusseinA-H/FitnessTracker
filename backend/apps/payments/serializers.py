from rest_framework import serializers
from payments.models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id', 'user', 'subscription', 'amount', 'currency', 
            'payment_method', 'payment_status', 'reference_number', 'proof_image', 'transaction_id'
        )
        read_only_fields = ('id', 'user', 'payment_status', 'transaction_id')
