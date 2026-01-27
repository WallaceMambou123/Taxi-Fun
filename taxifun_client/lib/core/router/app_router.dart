import 'package:flutter/material.dart';
import '/features/auth/presentation/screens/login_screen.dart';
import '/features/auth/presentation/screens/register_screen.dart';
import '/features/auth/presentation/screens/verify_otp_screen.dart';
import '/features/home/presentation/screens/home_page.dart';
import '/features/onboarding/presentation/screen/onboarding_screen.dart';

class AppRouter {
  static Map<String, WidgetBuilder> get routes => {
    '/': (context) => const OnboardingScreen(),
    '/LoginScreen': (context) => const LoginScreen(),
    '/RegisterScreen': (context) => const SignUpScreen(),
    '/HomeScreen': (context) => const HomeScreen(),
    '/VerifyOtpScreen': (context) => const VerifyOtpScreen(),
  };
}
