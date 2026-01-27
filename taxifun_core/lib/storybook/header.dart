// --- WIDGET : HEADER ---
import 'package:flutter/material.dart';

Widget buildHeader(String route) {
  return Container(
    height: 45,
    padding: const EdgeInsets.symmetric(horizontal: 12),
    // Couleur VS Code Header
    decoration: BoxDecoration(
      color: const Color(0xFF323233),
      border: Border(bottom: BorderSide(width: 1)),
    ),
    child: Row(
      children: [
        const Icon(Icons.local_taxi, color: Colors.orange, size: 25),

        const SizedBox(width: 10),

        const Text(
          "TAXIFUN CORE",
          style: TextStyle(
              color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
        ),

        const SizedBox(width: 80),
        Text(
          route,
          style: TextStyle(
              color: Color(0xFF9CDCFE),
              fontWeight: FontWeight.bold,
              fontSize: 13),
        ),

        const Spacer(),

        // Boutons d'accessibilité
        _headerAction(Icons.help_outline, "À propos"),
        _headerAction(Icons.settings, "Paramètres"),
        _headerAction(Icons.person, "Profil"),
      ],
    ),
  );
}

Widget _headerAction(IconData icon, String tooltip) {
  return Tooltip(
    message: tooltip,
    child: IconButton(
      icon: Icon(icon, color: Colors.grey[400], size: 18),
      onPressed: () {},
    ),
  );
}
