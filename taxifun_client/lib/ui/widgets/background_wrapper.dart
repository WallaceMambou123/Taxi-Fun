import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class BackgroundWrapper extends StatelessWidget {
  final Widget child;

  const BackgroundWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // On utilise un Stack pour superposer le fond et le contenu
      body: Stack(
        children: [
          // L'image SVG en arrière-plan
          Positioned.fill(
            child: SvgPicture.asset(
              'assets/images/Group.svg', // Votre fichier SVG
              fit: BoxFit.cover, // Pour qu'il remplisse tout l'écran
              colorFilter: ColorFilter.mode(
                Colors.white.withOpacity(0.05), // Très léger comme sur votre design
                BlendMode.dstATop,
              ),
            ),
          ),
          // Votre contenu (écrans, formulaires, etc.)
          SafeArea(child: child),
        ],
      ),
    );
  }
}