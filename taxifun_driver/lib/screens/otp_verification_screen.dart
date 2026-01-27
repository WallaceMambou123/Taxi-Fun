import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String phoneNumber;

  const OtpVerificationScreen({
    super.key,
    required this.phoneNumber,
  });

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final List<TextEditingController> _controllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());
  int _resendCountdown = 10;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();

    for (int i = 0; i < 4; i++) {
      _controllers[i].addListener(() {
        if (_controllers[i].text.length == 1 && i < 3) {
          _focusNodes[i + 1].requestFocus();
        } else if (_controllers[i].text.isEmpty && i > 0) {
          _focusNodes[i - 1].requestFocus();
        }
      });
    }
  }

  void _startResendTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        if (_resendCountdown > 0) {
          _resendCountdown--;
          _startResendTimer();
        } else {
          _canResend = true;
        }
      });
    });
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  String get _otp => _controllers.map((c) => c.text).join();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'WELCOME',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600),
        ),
      ),
      body: Stack(
        children: [
          // Vague orange en haut (comme tes autres écrans)
          Positioned(
            top: -MediaQuery.of(context).size.height * 0.18,
            right: -MediaQuery.of(context).size.width * 0.35,
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 1.4,
              height: MediaQuery.of(context).size.height * 0.65,
              child: CustomPaint(painter: WavePainter()),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  const Text(
                    'Phone Verification',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter your OTP code',
                    style: TextStyle(fontSize: 16, color: Colors.black54),
                  ),
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(fontSize: 14, color: Colors.black54),
                      children: [
                        const TextSpan(text: 'Enter the 4-digit code sent to you at\n'),
                        TextSpan(
                          text: '+237${widget.phoneNumber}',
                          style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
                        ),
                        const TextSpan(text: '  '),
                        WidgetSpan(
                          alignment: PlaceholderAlignment.middle,
                          child: GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: const Text(
                              'did you enter the correct number?',
                              style: TextStyle(
                                color: Colors.orange,
                                fontWeight: FontWeight.w500,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),

                  // OTP fields
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(4, (index) {
                      return SizedBox(
                        width: 70,
                        height: 70,
                        child: TextField(
                          controller: _controllers[index],
                          focusNode: _focusNodes[index],
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          maxLength: 1,
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                          decoration: InputDecoration(
                            counterText: '',
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: Colors.orange.shade200, width: 2),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(color: Colors.orange, width: 2.5),
                            ),
                          ),
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          onChanged: (value) {
                            if (value.isNotEmpty && index < 3) {
                              _focusNodes[index + 1].requestFocus();
                            }
                          },
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 40),

                  // Resend
                  Center(
                    child: Column(
                      children: [
                        Text(
                          _canResend
                              ? 'Resend Code'
                              : 'Resend Code in ${_resendCountdown.toString().padLeft(2, '0')} seconds',
                          style: TextStyle(
                            color: _canResend ? Colors.orange : Colors.grey,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (_canResend)
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _resendCountdown = 10;
                                _canResend = false;
                              });
                              _startResendTimer();
                              // TODO: Appeler API pour renvoyer OTP
                            },
                            child: const Text('Resend now'),
                          ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Bouton suivant (activé quand OTP complet)
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: _otp.length == 4
                          ? () {
                              // TODO: Vérifier OTP via API
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('OTP vérifié ! (simulation)')),
                              );
                            }
                          : null,
                      icon: const Icon(Icons.arrow_forward, size: 22),
                      label: const Text(
                        'Verify',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                        elevation: 2,
                        disabledBackgroundColor: Colors.orange.withOpacity(0.4),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class WavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.orange
      ..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(size.width * 0.55, 0);
    path.quadraticBezierTo(size.width * 0.25, size.height * 0.4, 0, size.height * 0.75);
    path.lineTo(0, size.height);
    path.lineTo(size.width, size.height);
    path.lineTo(size.width, 0);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_) => false;
}