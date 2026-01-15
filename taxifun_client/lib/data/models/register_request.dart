class RegisterRequest {
  final String name;
  final String email;
  final String phoneNumber;
  final String gender;

  RegisterRequest({
    required this.name,
    required this.email,
    required this.phoneNumber,
    required this.gender,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'phoneNumber': phoneNumber,
    'gender': gender,
  };
}