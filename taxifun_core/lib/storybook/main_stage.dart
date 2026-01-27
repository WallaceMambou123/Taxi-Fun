// --- WIDGET : MAIN STAGE ---

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:taxifun_core/storybook/models.dart';

class MainStage extends StatelessWidget {
  final String title;
  final Widget contentView;

  const MainStage(this.contentView, this.title, {super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
        child: Container(
      color: const Color(0xFF1E1E1E),
      child: Expanded(child: Center(child: contentView)),
    ));
  }
}

/*Widget _viewPortToggle(bool isMobile) {
  
  return Row(
    children: [
      Icon(Icons.smartphone,
          size: 14, color: isMobile ? Colors.orange : Colors.grey),
      Switch(
        value: isMobile,
        onChanged: (v) => setState(() => isMobile = v),
        activeThumbColor: Colors.orange,
      ),
    ],
  );
}*/

// --- SOUS-COMPOSANTS DE ZONE ---

class FolioView extends StatelessWidget {
  final Widget widget;
  final bool isMobile;
  const FolioView({super.key, required this.widget, required this.isMobile});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: isMobile ? 375 : MediaQuery.of(context).size.width * 0.8,
        height: isMobile ? 700 : MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(isMobile ? 32 : 4),
          border: Border.all(color: Colors.black, width: isMobile ? 8 : 1),
        ),
        child: Center(child: widget),
      ),
    );
  }
}

class ManuscriptView extends StatelessWidget {
  final String path;
  const ManuscriptView({super.key, required this.path});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: rootBundle.loadString(path),
      builder: (context, snapshot) {
        return Container(
          padding: const EdgeInsets.all(20),
          width: double.infinity,
          child: SingleChildScrollView(
            child: SelectableText(
              snapshot.data ?? "// Chargement du code source...",
              style: const TextStyle(
                  color: Color(0xFF9CDCFE),
                  fontFamily: 'monospace',
                  fontSize: 13),
            ),
          ),
        );
      },
    );
  }
}

class DescriptionView extends StatelessWidget {
  final Chapter chapter;
  const DescriptionView({super.key, required this.chapter});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(40),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(chapter.title,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          const Divider(color: Colors.white10),
          const SizedBox(height: 20),
          Text(chapter.description,
              style: const TextStyle(
                  color: Colors.grey, fontSize: 16, height: 1.5)),
        ],
      ),
    );
  }
}
