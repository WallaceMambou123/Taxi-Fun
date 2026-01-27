// lib/features/auth/presentation/widgets/otp_input_field.dart
import 'package:flutter/material.dart';
import 'package:pinput/pinput.dart';

class OtpInputField extends StatelessWidget {
  final TextEditingController controller;
  final Function(String)? onCompleted;

  const OtpInputField({super.key, required this.controller, this.onCompleted});

  @override
  Widget build(BuildContext context) {
    // Style par défaut des cases
    final defaultPinTheme = PinTheme(
      width: 56,
      height: 56,
      textStyle: const TextStyle(
        fontSize: 22,
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
    );

    // Style quand la case est sélectionnée (Focus)
    final focusedPinTheme = defaultPinTheme.copyDecorationWith(
      border: Border.all(color: Colors.blue, width: 2),
      color: Colors.white,
    );

    return Pinput(
      length: 4, // 4 Espaces comme demandé
      controller: controller,
      defaultPinTheme: defaultPinTheme,
      focusedPinTheme: focusedPinTheme,
      showCursor: true,
      onCompleted:
          onCompleted, // Déclenche l'action quand les 4 chiffres sont mis
      pinputAutovalidateMode: PinputAutovalidateMode.onSubmit,
    );
  }
}
