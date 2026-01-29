import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import 'package:taxifun/features/auth/data/auth_repository.dart';
import 'package:taxifun_core/taxifun_core.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'CM');
  bool _isPhoneValid = false;
  bool _isLoading = false;

  // On instancie le repository au lieu de l'ApiClient directement
  final AuthRepository _authRepo = AuthRepository();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _phoneNumber = PhoneNumber(isoCode: 'CM', phoneNumber: args);
    }
  }

  Future<void> _handleOtpRequest() async {
    if (!_isPhoneValid) {
      _showSnackBar("Veuillez entrer un numéro valide", isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Utilisation du repository simplifié
      // On envoie le numéro formatté (+237...)
      await _authRepo.requestOtp(_phoneNumber.phoneNumber!);

      if (mounted) {
        _showSnackBar("Code de vérification envoyé !");

        Navigator.pushNamed(
          context,
          '/VerifyOtpScreen',
          arguments: _phoneNumber.phoneNumber,
        );
      }
    } catch (errorMessage) {
      // Le repository renvoie maintenant directement le message d'erreur
      if (mounted) {
        _showSnackBar(errorMessage.toString(), isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- UI Methods ---

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          _buildBackgroundPattern(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28.0),
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        _buildBackButton(),
                        const SizedBox(height: 40),
                        _buildHeaderTitle(),
                        const SizedBox(height: 50),

                        TaxiFunPhoneInput(
                          initialValue: _phoneNumber,
                          onInputChanged: (PhoneNumber value) =>
                              _phoneNumber = value,
                          onInputValidated: (bool isValid) =>
                              setState(() => _isPhoneValid = isValid),
                        ),

                        const Spacer(),

                        TaxiButton(
                          title: "Recevoir le code",
                          isLoading: _isLoading,
                          onPressed: _handleOtpRequest,
                        ),

                        const SizedBox(height: 20),

                        CustomAuthFooter(
                          label: "Vous n'avez pas de compte ?",
                          actionText: "Inscrivez-vous",
                          onPressed: () =>
                              Navigator.pushNamed(context, '/RegisterScreen'),
                        ),

                        const SizedBox(height: 30),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Sous-Widgets inchangés ---

  Widget _buildBackgroundPattern() {
    return Positioned.fill(
      child: SvgPicture.asset('assets/images/Group.svg', fit: BoxFit.cover),
    );
  }

  Widget _buildHeaderTitle() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Obtenez votre code",
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryOrange,
          ),
        ),
        SizedBox(height: 10),
        Text(
          "Entrez votre numéro pour recevoir votre code d'accès.",
          style: TextStyle(color: Colors.grey, fontSize: 15),
        ),
      ],
    );
  }

  Widget _buildBackButton() {
    return IconButton(
      onPressed: () => Navigator.pop(context),
      icon: const Icon(Icons.arrow_back_ios_new, size: 20),
      style: IconButton.styleFrom(
        backgroundColor: Colors.grey[100],
        padding: const EdgeInsets.all(12),
      ),
    );
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : AppTheme.primaryOrange,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(20),
      ),
    );
  }
}
