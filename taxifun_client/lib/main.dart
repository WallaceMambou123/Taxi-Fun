import 'package:flutter/material.dart';
import 'core/router/app_router.dart';
import 'package:taxifun_core/taxifun_core.dart';

void main() {
  runApp(const TaxiFunApp());
}

class TaxiFunApp extends StatelessWidget {
  const TaxiFunApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Taxi-Fun',
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: AppRouter.routes,
    );
  }
}
