// --- WIDGET : SIDEBAR (Sommaire) ---
import 'package:flutter/material.dart';
import 'package:taxifun_core/storybook/models.dart';

class SideBar extends StatefulWidget {
  final List<SidebarItem> items;

  const SideBar(this.items, {super.key});

  @override
  State<SideBar> createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 275,
      color: const Color(0xFF252526),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text("COMPOSANTS",
                style: TextStyle(
                    color: Colors.grey,
                    fontSize: 11,
                    fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: widget.items.length,
              itemBuilder: (context, index) {
                final chapter = widget.items[index].chapter;
                final isSelected = _selectedIndex == index;

                return ListTile(
                  dense: true,
                  onTap: () => {
                    setState(() => _selectedIndex = index),
                    widget.items[index].action()
                  },
                  leading: Icon(chapter.icon,
                      color: isSelected ? Colors.orange : Colors.grey,
                      size: 18),
                  title: Text(chapter.title,
                      style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[400],
                          fontSize: 13)),
                  selected: isSelected,
                  selectedTileColor: Colors.white.withOpacity(0.05),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
