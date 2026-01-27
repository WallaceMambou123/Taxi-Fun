import 'package:flutter/material.dart';

// core imports
import 'package:taxifun_core/taxifun_core.dart';

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
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(180),
                          bottomRight: Radius.circular(180),
                        ),
                        child: Image.asset(
                          'assets/images/accueilP1.png',
                          fit: BoxFit
                              .contain, // "Cover" pour bien remplir l'arrondi
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
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                      children: [
                        const TextSpan(text: 'BIENVENUE '),
                        TextSpan(
                          text: 'SUR TAXIFUN',
                          style: TextStyle(color: orangeColor),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    "Plus qu'un simple taxi, Taxi-Fun est votre partenaire de route. Installez-vous confortablement, on s'occupe du reste.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.black54,
                      height: 1.4,
                    ),
                  ),

                  // footer
                  Spacer(),

                  TaxiButton(
                    title: "Commencer l'aventure",
                    onPressed: () {
                      Navigator.pushNamed(context, '/LoginScreen');
                    },
                  ),

                  const SizedBox(height: 20),

                  CustomAuthFooter(
                    label: "Vous n'avez pas de compte ?",
                    actionText: "Inscrivez-vous",
                    onPressed: () {
                      Navigator.pushNamed(context, '/RegisterScreen');
                    },
                  ),

                  // garde fou
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingIcon(
    IconData icon, {
    double? top,
    double? bottom,
    double? left,
    double? right,
  }) {
    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: const BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 2),
          ],
        ),
        child: Icon(icon, size: 28, color: orangeColor),
      ),
    );
  }
}
