import { contactUsEmail, Frontend_Base_URL } from './constants';

export const otpTemplate = (otp: number) => {
  return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
	
			.highlight {
				font-weight: bold;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<a href=${Frontend_Base_URL}><img class="logo"
					src="https://res.cloudinary.com/dk5bnn02q/image/upload/v1741844530/filmsterLogo_ywpjgv.png" alt="Filmster Logo"></a>
			<div class="message">OTP Verification Email</div>
			<div class="body">
				<p>Dear User,</p>
				<p>Thank you for registering with Filmster. To complete your registration, please use the following OTP
					(One-Time Password) to verify your account:</p>
				<h2 class="highlight">${otp}</h2>
				<p>This OTP is valid for 5 minutes. If you did not request this verification, please disregard this email.
				Once your account is verified, you will have access to our platform and its features.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:${contactUsEmail}">${contactUsEmail}</a>. We are here to help!</div>
		</div>
	</body>
	
	</html>`;
};

export const signUpSuccessTemplate = () => {
  return `<!DOCTYPE html>
	  <html>
	  
	  <head>
		  <meta charset="UTF-8">
		  <title>Welcome to Our Platform</title>
		  <style>
			  body {
				  background-color: #ffffff;
				  font-family: Arial, sans-serif;
				  font-size: 16px;
				  line-height: 1.4;
				  color: #333333;
				  margin: 0;
				  padding: 0;
			  }
	  
			  .container {
				  max-width: 600px;
				  margin: 0 auto;
				  padding: 20px;
				  text-align: center;
			  }
	  
			  .logo {
				  max-width: 200px;
				  margin-bottom: 20px;
			  }
	  
			  .message {
				  font-size: 18px;
				  font-weight: bold;
				  margin-bottom: 20px;
			  }
	  
			  .body {
				  font-size: 16px;
				  margin-bottom: 20px;
			  }
	  
			  .cta {
				  display: inline-block;
				  padding: 10px 20px;
				  background-color: #007bff;
				  color: #ffffff;
				  text-decoration: none;
				  border-radius: 5px;
				  font-size: 16px;
				  font-weight: bold;
				  margin-top: 20px;
			  }
	  
			  .support {
				  font-size: 14px;
				  color: #999999;
				  margin-top: 20px;
			  }
	  
		  </style>
	  </head>
	  
	  <body>
		  <div class="container">
			  <a href=${Frontend_Base_URL}><img class="logo"
					src="https://res.cloudinary.com/dk5bnn02q/image/upload/v1741844530/filmsterLogo_ywpjgv.png" alt="Filmster Logo"></a>
			  <div class="message">Welcome to Our Platform!</div>
			  <div class="body">
				  <p>Dear User,</p>
				  <p>Thank you for signing up! We're excited to have you on board.</p>
				  <a href=${Frontend_Base_URL} class="cta">Get Started</a>
				  <p>If you have any questions, feel free to reach out to our support team.</p>
			  </div>
			  <div class="support">If you need any help, please contact us at <a href="mailto:${contactUsEmail}">${contactUsEmail}</a>. We're happy to assist you!</div>
		  </div>
	  </body>
	  
	  </html>`;
};

export const forgotPassTemplate = (forgotPassLink: string) => {
  return `<!DOCTYPE html>
	  <html>
	  
	  <head>
		  <meta charset="UTF-8">
		  <title>OTP Verification Email</title>
		  <style>
			  body {
				  background-color: #ffffff;
				  font-family: Arial, sans-serif;
				  font-size: 16px;
				  line-height: 1.4;
				  color: #333333;
				  margin: 0;
				  padding: 0;
			  }
	  
			  .container {
				  max-width: 600px;
				  margin: 0 auto;
				  padding: 20px;
				  text-align: center;
			  }
	  
			  .logo {
				  max-width: 200px;
				  margin-bottom: 20px;
			  }
	  
			  .message {
				  font-size: 18px;
				  font-weight: bold;
				  margin-bottom: 20px;
			  }
	  
			  .body {
				  font-size: 16px;
				  margin-bottom: 20px;
			  }
	  
			  .cta {
				  display: inline-block;
				  padding: 10px 20px;
				  background-color: #FFD60A;
				  color: #000000;
				  text-decoration: none;
				  border-radius: 5px;
				  font-size: 16px;
				  font-weight: bold;
				  margin-top: 20px;
			  }
	  
			  .support {
				  font-size: 14px;
				  color: #999999;
				  margin-top: 20px;
			  }
	  
			  .highlight {
				  font-weight: bold;
				  color: white;
			  }

			  .button-style {
				  display: inline-block;
				  padding: 10px 20px;
				  background-color: #007bff;
				  color: white;
				  text-align: center;
				  text-decoration: none;
				  border-radius: 5px;
				  border: none;
				  cursor: pointer;
			  }
		  </style>
	  
	  </head>
	  
	  <body>
		  <div class="container">
			  <a href=${Frontend_Base_URL}><img class="logo"
					src="https://res.cloudinary.com/dk5bnn02q/image/upload/v1741844530/filmsterLogo_ywpjgv.png" alt="Filmster Logo"></a>
			  <div class="message">Reset your Password</div>
			  <div class="body">
				  <p>Dear User,</p>
				  <p>We received a request to reset your password for your account. Click the button below to set a new password:</p>
				  <a href="${forgotPassLink}" class="highlight button-style">Reset your Password</a>
				  <p>Use this link incase of redirecting not working :</p>
				  <p>${forgotPassLink}</p>
				  <p>This link is valid for 60 minutes. If you didn't request this, you can safely ignore this email.</p>
			  </div>
			  <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:${contactUsEmail}">${contactUsEmail}</a>. We are here to help!</div>
		  </div>
	  </body>
	  
	  </html>`;
};

export const resetPasswordSuccessTemplate = () => {
  return `<!DOCTYPE html>
	  <html>
	  
	  <head>
		  <meta charset="UTF-8">
		  <title>Password Reset Successful</title>
		  <style>
			  body {
				  background-color: #ffffff;
				  font-family: Arial, sans-serif;
				  font-size: 16px;
				  line-height: 1.4;
				  color: #333333;
				  margin: 0;
				  padding: 0;
			  }
	  
			  .container {
				  max-width: 600px;
				  margin: 0 auto;
				  padding: 20px;
				  text-align: center;
			  }
	  
			  .logo {
				  max-width: 200px;
				  margin-bottom: 20px;
			  }
	  
			  .message {
				  font-size: 18px;
				  font-weight: bold;
				  margin-bottom: 20px;
			  }
	  
			  .body {
				  font-size: 16px;
				  margin-bottom: 20px;
			  }
	  
			  .cta {
				  display: inline-block;
				  padding: 10px 20px;
				  background-color: #28a745;
				  color: #ffffff;
				  text-decoration: none;
				  border-radius: 5px;
				  font-size: 16px;
				  font-weight: bold;
				  margin-top: 20px;
			  }
	  
			  .support {
				  font-size: 14px;
				  color: #999999;
				  margin-top: 20px;
			  }
	  
		  </style>
	  </head>
	  
	  <body>
		  <div class="container">
			  <a href=${Frontend_Base_URL}><img class="logo"
					src="https://res.cloudinary.com/dk5bnn02q/image/upload/v1741844530/filmsterLogo_ywpjgv.png" alt="Filmster Logo"></a>
			  <div class="message">Password Reset Successful</div>
			  <div class="body">
				  <p>Dear User,</p>
				  <p>Your password has been successfully reset. You can now log in using your new password.</p>
				  <a href=${Frontend_Base_URL + '/login'} class="cta">Login to Your Account</a>
				  <p>If you did not request this change, please contact our support team immediately.</p>
			  </div>
			  <div class="support">If you have any questions or need assistance, please reach out to us at <ahref="mailto:${contactUsEmail}">${contactUsEmail}</ahref=>. We are here to help!</div>
		  </div>
	  </body>
	  
	  </html>`;
};
