import 'package:taxifun/core/session_manager.dart';
import 'package:taxifun_core/taxifun_core.dart';
import 'package:dio/dio.dart';

class AuthRepository {
  // On utilise l'ApiClient (Dio) que tu as déjà configuré
  final ApiClient _apiClient = ApiClient();

  // Outil pour sauvegarder le token de façon sécurisée (chiffrée)

  /// Étape 1 : Demander l'envoi de l'OTP
  Future<Response> requestOtp(String phoneNumber) async {
    try {
      return await _apiClient.dio.post(
        '/auth/otp/request',
        data: {'phoneNumber': phoneNumber, "role": "CLIENT"},
      );
    } on DioException catch (e) {
      // On propage l'erreur pour que l'UI puisse l'afficher
      throw e.response?.data['message'] ?? "Erreur lors de l'envoi de l'OTP";
    }
  }

  /// Étape 2 : Vérifier l'OTP et stocker le Token
  Future<bool> verifyOtp(String phoneNumber, String code) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/otp/verify',
        data: {'phoneNumber': phoneNumber, 'otpCode': code, "role": "CLIENT"},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // On récupère le JWT renvoyé par NestJS
        final String token = response.data['accessToken'];

        // On le cache précieusement dans le téléphone
        SessionManager.saveToken(token);

        return true;
      }
      return false;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? "Code invalide ou expiré";
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String gender,
  }) async {
    try {
      await _apiClient.dio.post(
        '/clients/register',
        data: {"firstName": name, "email": email, "phoneNumber": phone},
      );
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? "Erreur lors de l'inscription";
    }
  }
}
