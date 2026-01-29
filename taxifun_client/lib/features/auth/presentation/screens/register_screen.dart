import 'package:flutter/material.dart';
import 'package:taxifun/features/auth/data/auth_repository.dart';
import 'package:taxifun_core/taxifun_core.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  // 1. Contrôleurs pour récupérer les valeurs
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final AuthRepository _authRepo = AuthRepository();

  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'CM');
  bool _agreeToTerms = false;
  String? _selectedGender;
  bool _isLoading = false;

  // 2. Fonction de soumission
  Future<void> _handleRegister() async {
    if (_nameController.text.isEmpty || _selectedGender == null) {
      _showSnackBar("Veuillez remplir tous les champs", isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _authRepo.register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneNumber.phoneNumber ?? "",
        gender: _selectedGender!,
      );

      if (mounted) {
        _showSnackBar("Compte créé ! Veuillez valider votre numéro.");
        // Après inscription, on envoie vers le login pour déclencher l'OTP
        Navigator.pushReplacementNamed(
          context,
          '/LoginScreen',
          arguments: _phoneNumber.phoneNumber, //auto completion
        );
      }
    } catch (e) {
      if (mounted) _showSnackBar(e.toString(), isError: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Inscription',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryOrange,
                  ),
                ),
                const SizedBox(height: 40),

                _buildTextField(
                  hint: 'Nom complet',
                  controller: _nameController,
                ),
                const SizedBox(height: 20),

                _buildTextField(
                  hint: 'Email',
                  type: TextInputType.emailAddress,
                  controller: _emailController,
                ),
                const SizedBox(height: 20),

                TaxiFunPhoneInput(
                  initialValue: _phoneNumber,
                  onInputChanged: (value) => _phoneNumber = value,
                ),
                const SizedBox(height: 20),

                _buildGenderDropdown(),
                const SizedBox(height: 30),

                _buildTermsCheckbox(),

                const SizedBox(height: 60),

                TaxiButton(
                  title: "S'Inscrire",
                  isLoading: _isLoading,
                  // On désactive le bouton si les conditions ne sont pas cochées
                  onPressed: _agreeToTerms ? _handleRegister : null,
                ),

                const SizedBox(height: 20),

                CustomAuthFooter(
                  label: "Vous avez déjà un compte ?",
                  actionText: "Connectez-vous",
                  onPressed: () => Navigator.pushNamed(context, '/LoginScreen'),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- Widgets de construction ---

  Widget _buildTextField({
    required String hint,
    required TextEditingController controller,
    TextInputType type = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: type,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.primaryOrange, width: 2),
        ),
      ),
    );
  }

  Widget _buildGenderDropdown() {
    return DropdownButtonFormField<String>(
      value: _selectedGender,
      decoration: InputDecoration(
        hintText: 'Genre',
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      items: ['Male', 'Female']
          .map((gender) => DropdownMenuItem(value: gender, child: Text(gender)))
          .toList(),
      onChanged: (value) => setState(() => _selectedGender = value),
    );
  }

  Widget _buildTermsCheckbox() {
    return Row(
      children: [
        Checkbox(
          value: _agreeToTerms, // Variable booléenne de ta classe
          activeColor: Colors.green,
          onChanged: (value) {
            setState(() {
              _agreeToTerms = value ?? false;
            });
          },
        ),
        Expanded(
          child: RichText(
            text: TextSpan(
              text: 'By signing up, you agree to the ',
              style: const TextStyle(color: Colors.black87, fontSize: 14),
              children: [
                TextSpan(
                  text: 'Terms of service',
                  style: TextStyle(color: AppTheme.primaryOrange),
                ),
                const TextSpan(text: ' and '),
                TextSpan(
                  text: 'Privacy policy.',
                  style: TextStyle(color: AppTheme.primaryOrange),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }
}
