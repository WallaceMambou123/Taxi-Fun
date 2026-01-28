import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionManager {
  static const _storage = FlutterSecureStorage();
  static const _keyToken = 'auth_token';

  // Sauvegarder le token après le login
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  // Récupérer le token pour les appels API
  static Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  // Vérifier si l'utilisateur est connecté
  static Future<bool> isLoggedIn() async {
    String? token = await getToken();
    return token != null;
  }

  // Déconnexion
  static Future<void> logout() async {
    await _storage.delete(key: _keyToken);
  }
}
