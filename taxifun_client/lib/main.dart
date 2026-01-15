import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:taxifun/ui/screens/home_page.dart';

// Importe tes autres fichiers ici (assure-toi que les chemins sont corrects)
 import 'ui/screens/login_screen.dart';
 import 'ui/screens/register_screen.dart';

void main() {
  runApp(const TaxiFunApp());
}

class TaxiFunApp extends StatelessWidget {
  const TaxiFunApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Taxi-Fun',
      theme: ThemeData(
        // Utilisation de ta couleur spécifique comme thème de base
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFEC8C01)),
        fontFamily: 'Poppins',
      ),
      // Définition des routes pour la navigation
      initialRoute: '/',
      routes: {
        '/': (context) => const OnboardingScreen(),
        '/LoginScreen': (context) => const LoginScreen(),
        '/RegisterScreen': (context) => const SignUpScreen(),
        '/HomeScreen' : (context) => const HomeScreen()
      },
    );
  }
}

// --- ÉCRAN D'ACCUEIL (ONBOARDING) ---
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  final Color orangeColor = const Color(0xFFEC8C01);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          SafeArea(
            bottom: false,
            child: SizedBox(
              height: MediaQuery.of(context).size.height * 0.5,
              width: double.infinity, // Utilise toute la largeur disponible
              child: Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(80),
                          bottomRight: Radius.circular(80),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          )
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(180),
                          bottomRight: Radius.circular(180),
                        ),
                        child: Image.asset(
                          'assets/images/accueilP1.png',
                          fit: BoxFit.contain, // "Cover" pour bien remplir l'arrondi
                        ),
                      ),
                    ),
                  ),
                  _buildFloatingIcon(Icons.location_on, top: 40, left: 30),
                  _buildFloatingIcon(Icons.directions_car, top: 60, right: 30),
                  _buildFloatingIcon(Icons.map, bottom: 40, left: 10),
                  _buildFloatingIcon(Icons.phone, bottom: 20, right: 20),
                ],
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 20),
              child: Column(
                children: [
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
                      children: [
                        const TextSpan(text: 'BIENVENUE '),
                        TextSpan(text: 'SUR TAXI-FUN', style: TextStyle(color: orangeColor)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    "Plus qu'un simple taxi, Taxi-Fun est votre partenaire de route. Installez-vous confortablement, on s'occupe du reste.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 15, color: Colors.black54, height: 1.4),
                  ),
                  const SizedBox(height: 50), // Utilise Spacer pour pousser les boutons vers le bas
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/RegisterScreen');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: orangeColor,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                      elevation: 0,
                    ),
                    child: const Text('Commencer l\'aventure',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 15),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(color: Colors.black54, fontSize: 16),
                      children: [
                        const TextSpan(text: 'Avez-vous déjà un compte ? '),
                        TextSpan(
                          text: 'Connectez-vous',
                          style: TextStyle(
                            color: orangeColor,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              Navigator.pushNamed(context, '/LoginScreen');
                            },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingIcon(IconData icon, {double? top, double? bottom, double? left, double? right}) {
    return Positioned(
      top: top, bottom: bottom, left: left, right: right,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 2)]
        ),
        child: Icon(icon, size: 28, color: orangeColor),
      ),
    );
  }
}