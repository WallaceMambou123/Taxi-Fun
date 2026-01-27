import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:dio/dio.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart'; // Nécessaire pour le type PhoneNumber

// core imports
import 'package:taxifun_core/taxifun_core.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // --- 1. Gestion de l'état du Téléphone ---
  // On initialise avec le code ISO par défaut (Cameroun)
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'CM');
  bool _isPhoneValid = false;

  bool _isLoading = false;

  // Utilisation de l'ApiClient centralisé
  final ApiClient _apiClient = ApiClient();

  Future<void> _handleOtpRequest() async {
    // --- 2. Nouvelle Validation ---
    // On vérifie le booléen mis à jour par le widget
    if (!_isPhoneValid) {
      _showSnackBar("Veuillez entrer un numéro valide", isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      // --- 3. Envoi du numéro formaté ---
      // _phoneNumber.phoneNumber contient déjà le format international (+237...)
      final response = await _apiClient.dio.post(
        '/auth/otp/request',
        data: {"phoneNumber": _phoneNumber.phoneNumber, "role": "CLIENT"},
      );

      if (mounted) {
        _showSnackBar("Code de vérification envoyé !");

        // On passe le numéro à l'écran suivant
        Navigator.pushNamed(
          context,
          '/VerifyOtpScreen',
          arguments: _phoneNumber.phoneNumber,
        );
      }
    } on DioException catch (e) {
      final message =
          e.response?.data['message'] ?? "Erreur de connexion au serveur";
      _showSnackBar(message, isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- UI Methods ---

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Indispensable pour éviter que le clavier ne crée des erreurs de layout
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          _buildBackgroundPattern(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28.0),
              child: CustomScrollView(
                // Empêche le rebond bizarre si le contenu est petit
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverFillRemaining(
                    hasScrollBody:
                        false, // Permet à la Column d'utiliser Spacer()
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

                        // --- LE MAGICIEN ---
                        // Ce Spacer va pousser tout ce qui suit vers le bas
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
                              Navigator.pushNamed(context, '/HomeScreen'),
                        ),

                        // Un petit espace final pour ne pas coller au bord de l'écran
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

  // --- Sous-Widgets ---

  Widget _buildBackgroundPattern() {
    return Positioned.fill(
      child: SvgPicture.asset(
        'assets/images/Group.svg',
        fit: BoxFit.cover,
        // Correction : Gestion des erreurs si le SVG n'a pas de propriété couleur modifiable
        // colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.03), BlendMode.srcIn),
      ),
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
            color:
                AppTheme.primaryOrange, // Assure-toi que AppTheme est importé
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
