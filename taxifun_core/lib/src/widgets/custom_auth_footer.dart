import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

class CustomAuthFooter extends StatelessWidget {
  final String label;
  final String actionText;
  final VoidCallback onPressed;
  final TextStyle? labelStyle;
  final TextStyle? actionStyle;

  const CustomAuthFooter({
    super.key,
    required this.label,
    required this.actionText,
    required this.onPressed,
    this.labelStyle,
    this.actionStyle,
  });

  @override
  Widget build(BuildContext context) {
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: labelStyle ?? TextStyle(color: Colors.grey[600], fontSize: 14),
        children: [
          TextSpan(text: "$label "),
          TextSpan(
            text: actionText,
            style: actionStyle ??
                const TextStyle(
                  color: Colors.blue,
                  fontWeight: FontWeight.bold,
                ),
            // C'est ici que l'on rend le texte cliquable
            recognizer: TapGestureRecognizer()..onTap = onPressed,
          ),
        ],
      ),
    );
  }
}
