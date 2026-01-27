// lib/features/auth/presentation/screens/verify_otp_screen.dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

// core imports
import 'package:taxifun_core/taxifun_core.dart';

class VerifyOtpScreen extends StatefulWidget {
  const VerifyOtpScreen({super.key});

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final TextEditingController _otpController = TextEditingController();
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _phoneNumber; // On le récupère des arguments

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Récupération du numéro passé depuis LoginScreen
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _phoneNumber = args;
    }
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.length != 4) return;

    setState(() => _isLoading = true);

    try {
      final response = await _apiClient.dio.post(
        '/auth/otp/verify',
        data: {
          "phoneNumber": _phoneNumber,
          "otpCode": _otpController.text.trim(), //to int
          "role": "CLIENT", // Important pour ton backend NestJS
        },
      );

      // TODO: Sauvegarder le token (response.data['token']) dans SecureStorage
      print("TOKEN REÇU: ${response.data}");

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Connexion réussie !"),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/HomeScreen',
          (route) => false,
        );
      }
    } on DioException catch (e) {
      final msg = e.response?.data['message'] ?? "Code incorrect";
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendCode() async {
    // Logique pour rappeler /auth/otp/request
    try {
      await _apiClient.dio.post(
        '/auth/otp/request',
        data: {"phoneNumber": _phoneNumber, "role": "CLIENT"},
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Nouveau code envoyé !")));
      }
    } catch (e) {
      // Gérer l'erreur silencieusement ou via SnackBar
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),

              // Titre et Sous-titre
              const Text(
                "Vérification du code",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryOrange,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                "Entrez le code à 4 chiffres envoyé au $_phoneNumber",
                style: const TextStyle(fontSize: 15, color: Colors.grey),
              ),

              const SizedBox(height: 50),

              // 1. Widget séparé pour les 4 cases
              Center(
                child: OtpInputField(
                  controller: _otpController,
                  onCompleted: (val) =>
                      _verifyOtp(), // Auto-submit quand rempli
                ),
              ),

              const SizedBox(height: 40),

              // 2. Widget séparé pour le Timer
              OtpResendTimer(onResend: _resendCode),

              const Spacer(),

              // 3. Bouton taxi (Réutilisé)
              TaxiButton(
                title: 'Vérification',
                isLoading: _isLoading,
                onPressed: _verifyOtp,
              ),

              const SizedBox(height: 50),
            ],
          ),
        ),
      ),
    );
  }
}
