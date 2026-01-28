import 'package:flutter/material.dart';
import 'package:taxifun/core/session_manager.dart';
import 'core/router/app_router.dart';
import 'package:taxifun_core/taxifun_core.dart';

void main() async {
  // 1. Indispensable pour l'async avant le runApp
  WidgetsFlutterBinding.ensureInitialized();

  // 2. On vérifie si un token existe via ton SessionManager
  final bool loggedIn = await SessionManager.isLoggedIn();

  // 3. On lance l'app en passant l'information
  runApp(TaxiFunApp(isLoggedIn: loggedIn));
}

class TaxiFunApp extends StatelessWidget {
  final bool isLoggedIn;

  const TaxiFunApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Taxi-Fun',
      theme: AppTheme.lightTheme,

      // 4. On définit la route initiale dynamiquement
      initialRoute: isLoggedIn ? '/HomeScreen' : '/',

      routes: AppRouter.routes,
    );
  }
}
