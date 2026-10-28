package dev.teire.demo;

import com.google.common.base.CharMatcher;
import com.google.common.base.Function;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import java.util.List;

/** Tag normalisation for SKU labels, and stock totals computed when a count arrives. */
public final class Tags {
  private static final Function<List<Sku>, Integer> TOTAL = skus -> skus.stream().mapToInt(Sku::onHand).sum();

  private Tags() {}

  /** "  Cold   Storage " → "cold storage". */
  public static String normalize(String raw) {
    return CharMatcher.WHITESPACE.trimAndCollapseFrom(raw, ' ').toLowerCase();
  }

  /** Keeps letters, digits and single spaces: " Aisle-7 /  Bin#3 " → "aisle7 bin3". */
  public static String label(String raw) {
    return normalize(CharMatcher.JAVA_LETTER_OR_DIGIT.or(CharMatcher.is(' ')).retainFrom(normalize(raw)));
  }

  /** The total on hand, once the asynchronous stock count completes. */
  public static ListenableFuture<Integer> totalOnHand(ListenableFuture<List<Sku>> count) {
    return Futures.transform(count, TOTAL);
  }
}
