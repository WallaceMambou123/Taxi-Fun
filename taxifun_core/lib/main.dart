import 'package:flutter/material.dart';
import 'package:taxifun_core/storybook/storybook.dart';

void main() {
  runApp(const TaxiFunCoreApp());
}

class TaxiFunCoreApp extends StatelessWidget {
  const TaxiFunCoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TaxiFun Design System',
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.orange,
        fontFamily: 'Segoe UI', // Style Windows/VS Code
      ),
      home: const TheAlmanac(),
    );
  }
}
