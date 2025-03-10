# APIs
1 - string
2 - number
3 - image
4 - video
5 - bool
[1] - string[]
[2] - number[]

## Auth 

- Login - http://localhost:7777/auth/login(POST)
-- body -> email1*, password1*

- GenerateOTP - http://localhost:7777/auth/generateOTP - POST
-- body -> name1* email1* contactNo1* password1*

- SignUp - http://localhost:7777/auth/signup - POST
-- body -> name1* email1* contactNo1* password1* otp2*

- LogOut - http://localhost:7777/auth/logout - POST

- Send Mail for reset password - http://localhost:7777/auth/sendMailResetPassword - POST
-- body -> email1*

- Reset Password - http://localhost:7777/auth/resetPassword - POST
-- body -> email1* password1*

## /user

- change Password - PUT 
-- body -> password1*, newPassword1*

- Edit Profile - PUT 
-- body -> name1 contactNo1 dateOfBirth1 gender1 image3

- Get UserList - http://localhost:7777/user/list - GET
-- queryParams -> search1 page2 limit 2

- Create Admin - http://localhost:7777/user/updateAdmin - PUT
-- body -> userId1*

- Toggle User isActive - http://localhost:7777/user/updateActiveStatus - PUT
-- body -> userId1* isActive5*