import 'package:flutter/material.dart';  // ← IMPORT OBLIGATOIRE AJOUTÉ
import 'package:fluttertoast/fluttertoast.dart';
import 'api_client.dart';
import 'api_constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DriverService {
  static Future<void> registerDriver(String phoneNumber) async {
    try {
      await ApiClient.post(
        ApiConstants.driversRegister,
        data: {'phoneNumber': phoneNumber},
      );
      Fluttertoast.showToast(
        msg: 'Compte créé avec succès !',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Erreur inscription : $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      rethrow;
    }
  }

  static Future<void> requestOtp(String phoneNumber) async {
    try {
      await ApiClient.post(
        ApiConstants.otpRequest,
        data: {
          'phoneNumber': phoneNumber,
          'role': 'DRIVER',
        },
      );
      Fluttertoast.showToast(
        msg: 'Code OTP envoyé par SMS !',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Erreur demande OTP : $e',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      rethrow;
    }
  }

  static Future<String> verifyOtp(String phoneNumber, String otpCode) async {
    try {
      final response = await ApiClient.post(
        ApiConstants.otpVerify,
        data: {
          'phoneNumber': phoneNumber,
          'otpCode': otpCode,
          'role': 'DRIVER',
        },
      );

      final token = response.data['accessToken'] as String?;
      if (token == null || token.isEmpty) {
        throw Exception('Token non reçu');
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', token);
      ApiClient.setToken(token);

      Fluttertoast.showToast(
        msg: 'Connexion réussie !',
        backgroundColor: Colors.green,
        textColor: Colors.white,
      );

      return token;
    } catch (e) {
      Fluttertoast.showToast(
        msg: 'Code OTP invalide ou expiré',
        backgroundColor: Colors.red,
        textColor: Colors.white,
      );
      rethrow;
    }
  }
}