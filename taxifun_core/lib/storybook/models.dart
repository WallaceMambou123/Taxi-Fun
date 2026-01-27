// --- MODÈLE : CHAPTER ---
import 'package:flutter/material.dart';

class Chapter {
  final String title;
  final String filePath;
  final Widget widget;
  final String description;
  final IconData icon;

  Chapter({
    required this.title,
    required this.filePath,
    required this.widget,
    this.description = "Aucune description fournie pour ce composant.",
    this.icon = Icons.extension_rounded,
  });
}

class ActivityBarItem {
  final String tooltip;
  final IconData icon;
  final VoidCallback action;

  ActivityBarItem(
      {required this.icon, required this.action, required this.tooltip});
}

class SidebarItem {
  final Chapter chapter;
  final VoidCallback action;

  SidebarItem({required this.chapter, required this.action});
}
