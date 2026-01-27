import 'package:flutter/material.dart';
import 'package:taxifun_core/taxifun_core.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final Color orangeColor = const Color(0xFFEC8C01);
  bool _agreeToTerms = false; // Initialisé à false
  String? _selectedGender;

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
          // Plus simple que CustomScrollView pour ce cas
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Text(
                  'Inscription',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: orangeColor,
                  ),
                ),
                const SizedBox(height: 40),

                _buildTextField(hint: 'Name'),
                const SizedBox(height: 20),

                _buildTextField(
                  hint: 'Email',
                  type: TextInputType.emailAddress,
                ),
                const SizedBox(height: 20),

                _buildPhoneField(),
                const SizedBox(height: 20),

                _buildGenderDropdown(),
                const SizedBox(height: 30),

                _buildTermsCheckbox(),

                const SizedBox(height: 60), // Remplace le Spacer problématique

                TaxiButton(
                  title: "S'Inscrire",
                  isLoading: false,
                  onPressed: _agreeToTerms
                      ? () {
                          // Action backend
                        }
                      : null, // Désactivé si non coché
                ),

                const SizedBox(height: 20),

                CustomAuthFooter(
                  label: "Vous avez déjà un compte ?",
                  actionText: "Connectez-vous",
                  onPressed: () {
                    Navigator.pushNamed(context, '/LoginScreen');
                  },
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- WIDGETS DE CONSTRUCTION (DÉPLACÉS ICI POUR ACCÉDER À L'ÉTAT) ---

  Widget _buildTextField({
    required String hint,
    TextInputType type = TextInputType.text,
  }) {
    return TextField(
      keyboardType: type,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: orangeColor, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
      ),
    );
  }

  Widget _buildPhoneField() {
    return TextField(
      keyboardType: TextInputType.phone,
      decoration: InputDecoration(
        hintText: 'Your mobile number',
        prefixIcon: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(width: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Image.network(
                'https://flagcdn.com/w40/cm.png',
                width: 30,
                height: 20,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    const Icon(Icons.flag),
              ),
            ),
            const Icon(Icons.arrow_drop_down, color: Colors.black),
            const Text('+237', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(width: 12),
          ],
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: orangeColor, width: 2),
        ),
      ),
    );
  }

  Widget _buildGenderDropdown() {
    return DropdownButtonFormField<String>(
      value: _selectedGender,
      decoration: InputDecoration(
        hintText: 'Gender',
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: orangeColor, width: 2),
        ),
      ),
      items: ['Male', 'Female', 'Other'].map((String gender) {
        return DropdownMenuItem<String>(value: gender, child: Text(gender));
      }).toList(),
      onChanged: (value) => setState(() => _selectedGender = value),
    );
  }

  Widget _buildTermsCheckbox() {
    return Row(
      children: [
        Checkbox(
          value: _agreeToTerms,
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
                  style: TextStyle(
                    color: orangeColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const TextSpan(text: ' and '),
                TextSpan(
                  text: 'Privacy policy.',
                  style: TextStyle(
                    color: orangeColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
