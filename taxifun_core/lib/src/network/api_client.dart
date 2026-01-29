// lib/core/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  String get baseUrl {
    if (kReleaseMode) {
      return "http://taxifun-api-production-a9a2.up.railway.app"; // URL de production
    } else {
      return "http://192.168.39.220:3000"; // URL de développement locale
    }
  }

  Dio get dio => Dio(
        BaseOptions(
          baseUrl: baseUrl,
          contentType:
              Headers.jsonContentType, // IMPORTANT: Force JSON content-type
          responseType: ResponseType.json,
        ),
      );

  final storage = const FlutterSecureStorage();

  ApiClient() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Assurez-vous que Content-Type est toujours JSON
          options.headers['Content-Type'] = 'application/json';

          // On récupère le token stocké
          String? token = await storage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          print('📤 REQUEST: ${options.method} ${options.path}');
          print('   Data: ${options.data}');
          print('   Headers: ${options.headers}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('📥 RESPONSE: ${response.statusCode} - ${response.data}');
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          print('❌ ERROR: ${e.response?.statusCode} - ${e.response?.data}');
          return handler.next(e);
        },
      ),
    );
  }
}
