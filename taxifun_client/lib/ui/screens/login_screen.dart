import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter/gestures.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final Color orangeColor = const Color(0xFFEC8C01);
  bool _isPasswordVisible = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: null,
      body: Stack(
        children: [
          // 1. Fond SVG (Pattern)
          Positioned.fill(
            child: SvgPicture.asset(
              'assets/images/Group.svg',
              fit: BoxFit.cover,
              // On rend le motif très discret (3% d'opacité)
              colorFilter: ColorFilter.mode(
                Colors.black.withOpacity(0.03),
                BlendMode.srcIn,
              ),
            ),
          ),

          // 2. Contenu principal
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  // Bouton retour
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.arrow_back_ios_new, size: 20),
                    ),
                  ),

                  const SizedBox(height: 40),
                  const Text(
                    "Connexion",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFEC8C01),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Heureux de vous revoir ! Connectez-vous pour continuer.",
                    style: TextStyle(color: Colors.grey, fontSize: 15),
                  ),

                  const SizedBox(height: 50),

                  // Champ Email / Téléphone
                  _buildInputLabel("Email ou Numéro de téléphone"),
                  TextField(
                    decoration: InputDecoration(
                      hintText: "exemple@mail.com",
                      prefixIcon: Icon(Icons.person_outline, color: orangeColor),
                    ),
                  ),

                  const SizedBox(height: 25),

                  // Champ Mot de passe
                  _buildInputLabel("Mot de passe"),
                  TextField(
                    obscureText: !_isPasswordVisible,
                    decoration: InputDecoration(
                      hintText: "********",
                      prefixIcon: Icon(Icons.lock_outline, color: orangeColor),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                          color: Colors.grey,
                        ),
                        onPressed: () {
                          setState(() => _isPasswordVisible = !_isPasswordVisible);
                        },
                      ),
                    ),
                  ),

                  // Mot de passe oublié
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {},
                      child: Text(
                        "Mot de passe oublié ?",
                        style: TextStyle(color: orangeColor, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),

                  const SizedBox(height: 40),

                  // Bouton de connexion
                  ElevatedButton(
                    onPressed: () {
                      // Logique de connexion vers NestJS
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: orangeColor,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      "Se connecter",
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Lien vers Inscription
                  Center(
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(color: Colors.black54, fontSize: 15),
                        children: [
                          const TextSpan(text: "Nouveau sur Taxi-Fun ? "),
                          TextSpan(
                            text: "Inscrivez-vous",
                            style: TextStyle(
                              color: orangeColor,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                            recognizer: TapGestureRecognizer()..onTap = () {
                              // Aller vers RegisterScreen
                            },
                          ),
                        ],
                      ),
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

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
      ),
    );
  }
}