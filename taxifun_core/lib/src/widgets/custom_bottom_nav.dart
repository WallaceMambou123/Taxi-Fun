import 'package:flutter/material.dart';

class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final Color orangeColor;

  const CustomBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.orangeColor,
  });

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      color: Colors.white,
      shape: const CircularNotchedRectangle(),
      notchMargin: 10,
      child: Container(
        height: 70,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Groupe Gauche
            Row(
              children: [
                _buildNavItem(Icons.home_filled, "Home", 0),
                const SizedBox(width: 25),
                _buildNavItem(Icons.history, "Historique", 1),
              ],
            ),
            // Groupe Droit
            Row(
              children: [
                _buildNavItem(Icons.local_offer_outlined, "Offer", 3),
                const SizedBox(width: 25),
                _buildNavItem(Icons.person_outline, "Profile", 4),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    bool isSelected = currentIndex == index;
    return InkWell(
      onTap: () => onTap(index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isSelected ? orangeColor : Colors.grey,
            size: 26,
          ),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? orangeColor : Colors.grey,
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}