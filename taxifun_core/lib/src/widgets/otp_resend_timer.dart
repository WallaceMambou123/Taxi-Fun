// lib/features/auth/presentation/widgets/otp_resend_timer.dart
import 'dart:async';
import 'package:flutter/material.dart';

// core imports
import 'package:taxifun_core/taxifun_core.dart';

class OtpResendTimer extends StatefulWidget {
  final VoidCallback onResend;

  const OtpResendTimer({super.key, required this.onResend});

  @override
  State<OtpResendTimer> createState() => _OtpResendTimerState();
}

class _OtpResendTimerState extends State<OtpResendTimer> {
  int _secondsRemaining = 30;
  Timer? _timer;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    setState(() {
      _secondsRemaining = 30;
      _canResend = false;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        setState(() => _canResend = true);
        timer.cancel();
      }
    });
  }

  void _handleResend() {
    if (_canResend) {
      widget.onResend(); // Appelle l'API pour renvoyer le code
      _startTimer(); // Relance le chrono
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Aucun code reçu ? ",
          style: TextStyle(color: Colors.grey, fontSize: 14),
        ),
        GestureDetector(
          onTap: _handleResend,
          child: Text(
            _canResend ? "Envoyer encore" : "Renvoyer (${_secondsRemaining}s)",
            style: TextStyle(
              color: _canResend ? AppTheme.primaryOrange : Colors.grey,
              fontWeight: FontWeight.bold,
              decoration: _canResend ? TextDecoration.underline : null,
            ),
          ),
        ),
      ],
    );
  }
}
