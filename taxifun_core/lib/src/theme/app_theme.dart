import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryOrange = Color(0xFFEC8C01);

  static ThemeData get lightTheme => ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: primaryOrange),
    fontFamily: 'Poppins',
    useMaterial3: true,
  );
}
