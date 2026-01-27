// --- WIDGET : ACTIVITY BAR (Inspiré de VS Code) ---
import 'package:flutter/material.dart';
import 'package:taxifun_core/storybook/models.dart';

class ActivityBar extends StatefulWidget {
  final List<ActivityBarItem> items;

  const ActivityBar(this.items, {super.key});

  @override
  State<ActivityBar> createState() => _ActivityBarState();
}

class _ActivityBarState extends State<ActivityBar> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      color: const Color(0xFF333333),
      child: ListView.builder(
          itemCount: widget.items.length,
          itemBuilder: (contex, index) {
            ActivityBarItem item = widget.items[index];
            return _activityIcon(item.icon, () {
              setState(() => _selectedIndex = index);
              item.action();
            }, active: _selectedIndex == index, message: item.tooltip);
          }),
    );
  }
}

Widget _activityIcon(IconData icon, VoidCallback onTap,
    {bool active = false, String message = ""}) {
  return Tooltip(
    message: message,
    child: IconButton(
      icon:
          Icon(icon, color: active ? Colors.white : Colors.grey[600], size: 24),
      onPressed: onTap,
    ),
  );
}
