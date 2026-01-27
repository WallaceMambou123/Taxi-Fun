import 'package:flutter/material.dart';
import 'package:taxifun_core/storybook/activity_bar.dart';
import 'package:taxifun_core/storybook/header.dart';
import 'package:taxifun_core/storybook/main_stage.dart';
import 'package:taxifun_core/storybook/models.dart';
import 'package:taxifun_core/storybook/sidebar.dart';
import 'package:taxifun_core/storybook/storybook_data.dart';

class TheAlmanac extends StatefulWidget {
  const TheAlmanac({super.key});

  @override
  State<TheAlmanac> createState() => _TheAlmanacState();
}

class _TheAlmanacState extends State<TheAlmanac> {
  late String _activeView;
  late Widget _activeWidget;
  int? _selectedIndex = 0;
  bool _isSidebarOpen = true;

  // Liste des composants (Le contenu de ta bibliothèque)
  late List<SidebarItem> sidebarItems =
      List.generate(storyChapters.length, (index) {
    return SidebarItem(
        chapter: storyChapters.values.toList()[index],
        action: () => setState(() {
              _selectedIndex = index;
            }));
  }, growable: false);

  // Listes des boutons de l'activity bar
  late List<ActivityBarItem> items = [
    ActivityBarItem(
        icon: Icons.menu,
        action: () => setState(() {
              _isSidebarOpen = !_isSidebarOpen;
            }),
        tooltip: "Explorateur"),
    ActivityBarItem(
        icon: Icons.smartphone,
        action: () => setState(() {
              _activeView = 'DEMO';
              _activeWidget =
                  FolioView(widget: selectedChapter.widget, isMobile: true);
            }),
        tooltip: "Aperçu Mobile"),
    ActivityBarItem(
        icon: Icons.computer,
        action: () => setState(() {
              _activeView = 'DEMO';
              _activeWidget =
                  FolioView(widget: selectedChapter.widget, isMobile: false);
            }),
        tooltip: "Aperçu PC"),
    ActivityBarItem(
        icon: Icons.code,
        action: () => setState(() {
              _activeView = 'CODE';
              _activeWidget = ManuscriptView(path: selectedChapter.filePath);
            }),
        tooltip: "Code Source"),
    ActivityBarItem(
        icon: Icons.info_outline,
        action: () => setState(() {
              _activeView = 'INFO';
              _activeWidget = DescriptionView(chapter: selectedChapter);
            }),
        tooltip: "Informations"),
  ];

  Chapter get selectedChapter => sidebarItems[_selectedIndex!].chapter;

  @override
  void initState() {
    super.initState();
    _selectedIndex = 0;
    _activeView = 'DEMO';
    _activeWidget = FolioView(widget: selectedChapter.widget, isMobile: true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E1E1E), // Fond sombre global
      body: Column(
        children: [
          // 1. --- THE LIBRARY HEADER (Barre supérieure) ---
          buildHeader('${selectedChapter.title} > $_activeView'),

          Expanded(
            child: Row(
              children: [
                // 2. --- ACTIVITY BAR (Barre d'icônes latérale étroite) ---
                ActivityBar(items),

                // 3. --- TABLE OF CONTENTS (Le Sommaire) ---
                if (_isSidebarOpen) SideBar(sidebarItems),

                // 4. --- MAIN STAGE (Zone d'aperçu) ---
                MainStage(_activeWidget, _activeView),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
