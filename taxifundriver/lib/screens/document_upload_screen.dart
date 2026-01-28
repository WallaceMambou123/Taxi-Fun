import 'package:flutter/material.dart';

class DocumentUploadScreen extends StatelessWidget {
  final String title;           // ex: "Permis de conduire" ou "Pièce d'identité"
  final String documentType;    // Pour futur usage (ex: "permis", "cni")

  const DocumentUploadScreen({
    super.key,
    required this.title,
    required this.documentType,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.orange,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'BACK',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      body: Stack(
        children: [
          // Vague/triangle orange en haut à droite (cohérent avec tes autres écrans)
          Positioned(
            top: 0,
            right: 0,
            child: CustomPaint(
              size: Size(MediaQuery.of(context).size.width * 0.8,
                  MediaQuery.of(context).size.height * 0.30),
              painter: DiagonalOrangePainter(),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 24),

                  // Titre + icône document
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.25),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.description_outlined,
                          color: Colors.white,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Bloc instructions
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Instructions',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          '• Assurez-vous que le document est lisible\n'
                          '• Évitez les reflets et les ombres\n'
                          '• Capturez tout le document dans le cadre\n'
                          '• Le document doit être valide et non expiré',
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.5,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Cadre de capture photo / upload
                  Expanded(
                    child: Center(
                      child: Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxHeight: 320),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.orange.shade300,
                            width: 2,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.camera_alt_outlined,
                              size: 80,
                              color: Colors.orange,
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Placez le document ici',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Bouton "Charger un fichier"
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Ouvrir galerie / caméra
                        // Exemple : image_picker ou file_picker
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Ouverture de la galerie... (à implémenter)')),
                        );
                      },
                      icon: const Icon(Icons.upload_file, color: Colors.orange),
                      label: const Text(
                        'Charger un fichier',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.orange,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.orange, width: 2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Bouton Continuer
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        // TODO: Vérifier si fichier chargé → passer à l'écran suivant
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Document soumis (simulation)')),
                        );
                      },
                      icon: const Icon(Icons.arrow_forward, size: 22),
                      label: const Text(
                        'Continuer',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.orange,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(32),
                        ),
                        elevation: 2,
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

// Peinture pour la vague/triangle orange en haut à droite
class DiagonalOrangePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.orange
      ..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(size.width, 0);
    path.lineTo(0, size.height * 0.55);
    path.lineTo(0, size.height);
    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_) => false;
}