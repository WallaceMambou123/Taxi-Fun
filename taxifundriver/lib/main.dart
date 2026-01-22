import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart'; // ou login_screen si tu veux tester directement

void main() {
  runApp(const TaxiFunDriverApp());
}

class TaxiFunDriverApp extends StatelessWidget {
  const TaxiFunDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaxiFun Driver',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
      ),
      home: const WelcomeScreen(), // ← change ici en LoginScreen pour tester
    );
  }
}