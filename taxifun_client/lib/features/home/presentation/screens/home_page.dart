import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

// core imports
import 'package:taxifun_core/taxifun_core.dart';

// import 'package:flutter_google_places/flutter_google_places.dart';
// import 'package:google_api_headers/google_api_headers.dart';
// import 'package:google_maps_webservice/places.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final Color orangeColor = const Color(0xFFEC8C01);
  int _selectedIndex = 0;

  late GoogleMapController _mapController;

  LatLng _currentPosition = const LatLng(
    3.8667,
    11.5167,
  ); // Position par défaut (Yaoundé)
  bool _isLoadingLocation = true;

  final Set<Marker> _markers = {};
  final Set<Circle> _circles = {};

  final TextEditingController _destinationController = TextEditingController();

  // Remplace par TA clé Google Places API (doit avoir Places API + Maps SDK activés)
  //static const String googleApiKey = "TA_CLÉ_GOOGLE_PLACES_ICI";

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  // 1. Obtenir la position réelle de l'utilisateur
  Future<void> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Veuillez activer la localisation")),
      );
      setState(() => _isLoadingLocation = false);
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.deniedForever) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "Autorisation de localisation refusée définitivement",
            ),
          ),
        );
        setState(() => _isLoadingLocation = false);
        return;
      }
    }

    if (permission == LocationPermission.denied) {
      setState(() => _isLoadingLocation = false);

      return;
    }

    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );

    setState(() {
      _currentPosition = LatLng(position.latitude, position.longitude);
      _isLoadingLocation = false;
      _addMarkerAndCircles();
    });

    // Centrer la caméra sur la position
    _mapController.animateCamera(
      CameraUpdate.newLatLngZoom(_currentPosition, 15.0),
    );
  }

  // 2. Ajouter le marker + cercles autour de la position actuelle
  void _addMarkerAndCircles() {
    _markers.clear();
    _circles.clear();

    _markers.add(
      Marker(
        markerId: const MarkerId('current_location'),
        position: _currentPosition,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: const InfoWindow(title: 'Ma position actuelle'),
      ),
    );

    _circles.addAll([
      Circle(
        circleId: const CircleId('circle1'),
        center: _currentPosition,
        radius: 800,
        fillColor: orangeColor.withOpacity(0.2),
        strokeWidth: 0,
      ),
      Circle(
        circleId: const CircleId('circle2'),
        center: _currentPosition,
        radius: 500,
        fillColor: orangeColor.withOpacity(0.3),
        strokeWidth: 0,
      ),
    ]);
  }

  // 3. Recherche de destination avec Google Places Autocomplete
  // Future<void> _showPlacesAutocomplete() async {
  //   Prediction? prediction = await PlacesAutocomplete.show(
  //     context: context,
  //     apiKey: googleApiKey,
  //     mode: Mode.overlay, // ou Mode.fullscreen
  //     language: "fr",
  //     components: [Component(Component.country, "cm")], // Limiter au Cameroun
  //     hint: "Entrez votre destination",
  //     onError: (response) {
  //       ScaffoldMessenger.of(context).showSnackBar(
  //         SnackBar(content: Text("Erreur Places API: ${response.errorMessage}")),
  //       );
  //     },
  //   );
  //
  //   if (prediction != null) {
  //     setState(() {
  //       _destinationController.text = prediction.description ?? "";
  //     });
  //
  //     // Optionnel : Récupérer les coordonnées de la destination
  //     GoogleMapsPlaces places = GoogleMapsPlaces(
  //       apiKey: googleApiKey,
  //       apiHeaders: await const GoogleApiHeaders().getHeaders(),
  //     );
  //
  //     PlacesDetailsResponse detail = await places.getDetailsByPlaceId(prediction.placeId!);
  //     final lat = detail.result.geometry!.location.lat;
  //     final lng = detail.result.geometry!.location.lng;
  //
  //     LatLng destination = LatLng(lat, lng);
  //
  //     // Ajouter un marker destination
  //     _markers.add(
  //       Marker(
  //         markerId: const MarkerId('destination'),
  //         position: destination,
  //         icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
  //       ),
  //     );
  //
  //     // Recentrer la map pour montrer départ + arrivée
  //     _mapController.animateCamera(
  //       CameraUpdate.newLatLngBounds(
  //         LatLngBounds(
  //           southwest: _currentPosition,
  //           northeast: destination,
  //         ),
  //         100, // padding
  //       ),
  //     );
  //
  //     setState(() {});
  //   }
  // }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
  }

  @override
  void dispose() {
    _mapController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: Icon(Icons.menu, color: orangeColor, size: 28),
        actions: [
          Icon(Icons.search, color: orangeColor, size: 28),
          const SizedBox(width: 16),
          Icon(Icons.notifications_outlined, color: orangeColor, size: 28),
          const SizedBox(width: 16),
        ],
      ),
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _currentPosition,
              zoom: 14.0,
            ),
            markers: _markers,
            circles: _circles,
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            zoomControlsEnabled: false,
          ),

          // Indicateur de chargement position
          if (_isLoadingLocation)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFFEC8C01)),
            ),

          // Panel du bas
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: MediaQuery.of(context).size.height * 0.25,
              decoration: const BoxDecoration(
                color: Color(0xFFF8F9FA),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              padding: const EdgeInsets.all(24),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // Bouton Rental
                    // ElevatedButton(
                    //   onPressed: () {},
                    //   style: ElevatedButton.styleFrom(
                    //     backgroundColor: orangeColor,
                    //     padding: const EdgeInsets.symmetric(vertical: 16),
                    //     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    //   ),
                    //   child: const Text('Rental', style: TextStyle(fontSize: 18, color: Colors.white)),
                    // ),
                    const SizedBox(height: 20),

                    // Champ destination avec autocomplete
                    TextField(
                      controller: _destinationController,
                      //readOnly: false, // Pour forcer l'utilisation de l'autocomplete
                      // onTap: _showPlacesAutocomplete,
                      decoration: InputDecoration(
                        hintText: 'Entrez votre destination',
                        suffixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 18,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Transport / Carpool
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: orangeColor,
                            ),
                            child: const Text(
                              'Transport',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              side: BorderSide(color: orangeColor),
                            ),
                            child: Text(
                              'Carpool',
                              style: TextStyle(color: orangeColor),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Book my ride
                    ElevatedButton(
                      onPressed: _destinationController.text.isEmpty
                          ? null
                          : () {
                              // Logique de réservation ici
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: orangeColor,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                      child: const Text(
                        'Book my ride',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Navigation Bar (inchangée)
          // ... (identique à ta version précédente)
        ],
      ),
      floatingActionButton: Container(
        height: 70,
        width: 70,
        child: FloatingActionButton(
          onPressed: () =>
              setState(() => _selectedIndex = 2), // Index du Wallet
          backgroundColor: orangeColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          elevation: 4,
          child: const Icon(
            Icons.account_balance_wallet_outlined,
            size: 35,
            color: Colors.white,
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // APPEL DU COMPOSANT SÉPARÉ
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _selectedIndex,
        orangeColor: orangeColor,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
    );
  }
}
