import 'package:flutter/material.dart';
import 'otp_verification_screen.dart';
import 'document_upload_screen.dart';  // Pour pièce d’identité

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String _selectedType = 'Free';
  final _formKey = GlobalKey<FormState>();

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _continueRegistration() {
    if (_formKey.currentState?.validate() ?? false) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Inscription validée ! Passage à l\'upload de document...'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigation vers l'écran pièce d'identité
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const DocumentUploadScreen(
            title: 'Pièce d\'identité',
            documentType: 'cni',
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez remplir correctement tous les champs'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

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
          'BACK',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w500),
        ),
      ),
      body: Stack(
        children: [
          Positioned(
            top: -MediaQuery.of(context).size.height * 0.22,
            right: -MediaQuery.of(context).size.width * 0.4,
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 1.5,
              height: MediaQuery.of(context).size.height * 0.7,
              child: CustomPaint(painter: WavePainter()),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 24),

                    // Photo de profil + icône caméra (plus grand et mieux centré)
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        CircleAvatar(
                          radius: 70,
                          backgroundColor: Colors.grey.shade100,
                          child: const Icon(
                            Icons.person_outline_rounded,
                            size: 100,
                            color: Colors.grey,
                          ),
                        ),
                        Positioned(
                          bottom: 4,
                          right: 4,
                          child: CircleAvatar(
                            radius: 26,
                            backgroundColor: Colors.orange,
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                              size: 26,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 48),

                    // Toggle Free / Business amélioré
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(color: Colors.orange.shade200, width: 1.5),
                      ),
                      padding: const EdgeInsets.all(6),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _buildToggleButton('Free', _selectedType == 'Free'),
                          _buildToggleButton('Business', _selectedType == 'Business'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 56),

                    _buildTextField(
                      label: 'Prénom',
                      controller: _firstNameController,
                      validator: (v) => v?.trim().isEmpty ?? true ? 'Champ obligatoire' : null,
                    ),
                    const SizedBox(height: 24),

                    _buildTextField(
                      label: 'Nom',
                      controller: _lastNameController,
                      validator: (v) => v?.trim().isEmpty ?? true ? 'Champ obligatoire' : null,
                    ),
                    const SizedBox(height: 24),

                    _buildTextField(
                      label: 'Adresse email',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) {
                        if (v?.trim().isEmpty ?? true) return 'Champ obligatoire';
                        if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v!)) {
                          return 'Email invalide';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    _buildTextField(
                      label: 'Téléphone',
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      validator: (v) {
                        if (v?.trim().isEmpty ?? true) return 'Champ obligatoire';
                        if (v!.trim().length < 8) return 'Au moins 8 chiffres';
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),

                    _buildTextField(
                      label: 'Adresse',
                      controller: _addressController,
                      validator: (v) => v?.trim().isEmpty ?? true ? 'Champ obligatoire' : null,
                    ),

                    const SizedBox(height: 64),

                    SizedBox(
                      width: double.infinity,
                      height: 60,
                      child: ElevatedButton.icon(
                        onPressed: _continueRegistration,
                        icon: const Icon(Icons.arrow_forward, size: 24),
                        label: const Text(
                          'Continuer',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          elevation: 4,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),

                    const SizedBox(height: 48),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton(String label, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() => _selectedType = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.orange : Colors.transparent,
          borderRadius: BorderRadius.circular(40),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.orange.shade800,
            fontWeight: FontWeight.w700,
            fontSize: 17,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey.shade700, fontSize: 15),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.orange.shade300, width: 2),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.orange, width: 3),
        ),
        errorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.redAccent, width: 2),
        ),
        focusedErrorBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.redAccent, width: 3),
        ),
        errorStyle: const TextStyle(color: Colors.redAccent, fontSize: 13),
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