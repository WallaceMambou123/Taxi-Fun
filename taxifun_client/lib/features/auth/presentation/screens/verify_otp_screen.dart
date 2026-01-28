import 'package:flutter/material.dart';
import 'package:taxifun/features/auth/data/auth_repository.dart';
import 'package:taxifun_core/taxifun_core.dart';

class VerifyOtpScreen extends StatefulWidget {
  const VerifyOtpScreen({super.key});

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  final TextEditingController _otpController = TextEditingController();

  // Utilisation de notre repository centralisé
  final AuthRepository _authRepo = AuthRepository();

  bool _isLoading = false;
  String? _phoneNumber;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _phoneNumber = args;
    }
  }

  Future<void> _verifyOtp() async {
    // Validation locale rapide (ex: ton backend attend 4 chiffres)
    if (_otpController.text.length < 4) {
      _showSnackBar("Veuillez entrer le code complet", isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Le repository fait tout : Appel API + Sauvegarde du Token JWT
      final bool isSuccess = await _authRepo.verifyOtp(
        _phoneNumber ?? "",
        _otpController.text.trim(),
      );

      if (isSuccess && mounted) {
        _showSnackBar("Connexion réussie !", isError: false);

        // Redirection vers l'accueil en vidant la pile de navigation
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/HomeScreen',
          (route) => false,
        );
      }
    } catch (errorMessage) {
      if (mounted) {
        _showSnackBar(errorMessage.toString(), isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resendCode() async {
    try {
      await _authRepo.requestOtp(_phoneNumber ?? "");
      if (mounted) {
        _showSnackBar("Nouveau code envoyé !");
      }
    } catch (errorMessage) {
      if (mounted) {
        _showSnackBar(errorMessage.toString(), isError: true);
      }
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
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.black,
            size: 20,
          ),
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
                "Entrez le code envoyé au $_phoneNumber",
                style: const TextStyle(fontSize: 15, color: Colors.grey),
              ),
              const SizedBox(height: 50),

              Center(
                child: OtpInputField(
                  controller: _otpController,
                  onCompleted: (val) => _verifyOtp(),
                ),
              ),

              const SizedBox(height: 40),
              OtpResendTimer(onResend: _resendCode),
              const Spacer(),

              TaxiButton(
                title: 'Vérifier',
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

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
