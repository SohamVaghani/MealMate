from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from core.models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role') # optional, to force specific portal

    if not username or not password:
        return Response({'success': False, 'message': 'Please provide email and password.'}, status=400)

    # Demo Auto-Provisioning System
    if username in ['admin', 'restaurant', 'delivery', 'customer'] and password == 'password123':
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            role_map = {'admin': 'ADMIN', 'restaurant': 'RESTAURANT', 'delivery': 'DELIVERY', 'customer': 'CUSTOMER'}
            user = User.objects.create_user(username=username, email=f"{username}@mealmate.com", password=password, role=role_map[username])
        
        # Auth bypass check to return proper user payload
        user = authenticate(username=username, password=password)
    else:
        user = authenticate(username=username, password=password)

    if not user:
        # maybe username is an email? find user by email.
        try:
            usr = User.objects.get(email=username)
            user = authenticate(username=usr.username, password=password)
        except User.DoesNotExist:
            user = None

    if not user:
        return Response({'success': False, 'message': 'Invalid credentials.'}, status=401)

    if role and user.role != role and user.role != 'ADMIN':
        return Response({'success': False, 'message': f'Access denied. You are not a {role}.'}, status=403)

    # Return a basic token/user info
    return Response({
        'success': True,
        'user': {
            'id': str(user.id) if hasattr(user, 'id') else None,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        },
        'token': f'fake-jwt-token-{user.username}'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'CUSTOMER')

    if not username or not email or not password:
        return Response({'success': False, 'message': 'Please provide all fields.'}, status=400)

    try:
        from django.contrib.auth.hashers import make_password
        import pymongo
        from datetime import datetime

        client = pymongo.MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']

        if db.core_user.find_one({'username': username}) or db.core_user.find_one({'email': email}):
            return Response({'success': False, 'message': 'Username or Email already taken.'}, status=400)
        
        # Get max ID for relational databases mock
        max_u = db.core_user.find_one(sort=[("id", -1)])
        new_id = (max_u['id'] + 1) if max_u and 'id' in max_u else 1000

        doc = {
            'id': new_id,
            'password': make_password(password),
            'is_superuser': role == 'ADMIN',
            'username': username,
            'first_name': '',
            'last_name': '',
            'email': email,
            'is_staff': role == 'ADMIN',
            'is_active': True,
            'date_joined': datetime.now(),
            'role': role,
            'phone': ''
        }
        
        user_obj_id = db.core_user.insert_one(doc).inserted_id

        # Also initialize user profiles if necessary
        if role == 'CUSTOMER':
            db.core_customerprofile.insert_one({'user_id': new_id, 'saved_addresses': '[]', 'phone_number': ''})
        elif role == 'RESTAURANT':
            db.core_restaurant.insert_one({
                'id': new_id,
                'name': f"{username} Restaurant",
                'owner_id': new_id,
                'description': '',
                'address': '',
                'banner_url': '',
                'is_open': True,
                'rating': 0.0
            })
        elif role == 'DELIVERY':
            db.core_deliverypartnerprofile.insert_one({
                'id': new_id,
                'user_id': new_id,
                'vehicle_number': 'UNKNOWN',
                'vehicle_type': 'Bike',
                'is_online': False,
                'current_location': ''
            })
        
        return Response({
            'success': True,
            'user': {
                'username': username,
                'email': email,
                'role': role,
            },
            'token': f'fake-jwt-token-{username}'
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'success': False, 'message': f'Server error: {str(e)}'}, status=500)
