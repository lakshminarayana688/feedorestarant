import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../demo/demo_data.dart';
import '../models/offer_model.dart';

class OfferState {
  final List<OfferModel> offers;
  final bool isLoading;
  final String? error;

  OfferState({
    required this.offers,
    this.isLoading = false,
    this.error,
  });

  OfferState copyWith({
    List<OfferModel>? offers,
    bool? isLoading,
    String? error,
  }) {
    return OfferState(
      offers: offers ?? this.offers,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class OfferNotifier extends StateNotifier<OfferState> {
  OfferNotifier() : super(OfferState(offers: DemoData.initialOffers));

  void toggleOfferStatus(String offerId, bool isActive) {
    final list = List<OfferModel>.from(state.offers);
    final index = list.indexWhere((o) => o.id == offerId);
    if (index != -1) {
      list[index] = list[index].copyWith(isActive: isActive);
      state = state.copyWith(offers: list);
    }
  }

  void addOffer(OfferModel offer) {
    state = state.copyWith(offers: [offer, ...state.offers]);
  }
}

final offerProvider = StateNotifierProvider<OfferNotifier, OfferState>((ref) {
  return OfferNotifier();
});
