
import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart';
import 'screens/login_screen.dart';
import 'screens/otp_verification_screen.dart';
import 'screens/register_screen.dart';
import 'screens/document_upload_screen.dart';
import 'screens/permis_upload_screen.dart';           // si tu l'as créé
import 'screens/vehicle_info_screen.dart';
import 'screens/verification_success_screen.dart';

void main() {
  runApp(const TaxiFunDriverApp());
}

class TaxiFunDriverApp extends StatelessWidget {
  const TaxiFunDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaxiFun Driver - Debug Menu',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
      ),
      home: const DebugMenuScreen(),
    );
  }
}

class DebugMenuScreen extends StatelessWidget {
  const DebugMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug - Toutes les pages'),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildButton(
            context,
            title: '1. Welcome Screen',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const WelcomeScreen()),
            ),
          ),
          _buildButton(
            context,
            title: '2. Login Screen',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
            ),
          ),
          _buildButton(
            context,
            title: '3. OTP Verification (exemple avec +237 690 00 00 00)',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const OtpVerificationScreen(phoneNumber: '690000000'),
              ),
            ),
          ),
          _buildButton(
            context,
            title: '4. Register / Inscription',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterScreen()),
            ),
          ),
          _buildButton(
            context,
            title: '5. Upload Pièce d\'identité',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const DocumentUploadScreen(
                  title: 'Pièce d\'identité',
                  documentType: 'cni',
                ),
              ),
            ),
          ),
          _buildButton(
            context,
            title: '6. Upload Permis de conduire',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PermisUploadScreen()),
            ),
          ),
          _buildButton(
            context,
            title: '7. Informations véhicule',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const VehicleInfoScreen()),
            ),
          ),
          _buildButton(
            context,
            title: '8. Vérification Finale (succès)',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const VerificationSuccessScreen()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(BuildContext context, {required String title, required VoidCallback onTap}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.orange.shade50,
          foregroundColor: Colors.orange.shade900,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 1,
        ),
        child: Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}