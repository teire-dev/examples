package dev.teire.demo;

import com.google.common.base.Objects;

/** A stock-keeping unit with its on-hand quantity. */
public final class Sku {
  private final String code;
  private final int onHand;

  public Sku(String code, int onHand) {
    this.code = code;
    this.onHand = onHand;
  }

  public String code() {
    return code;
  }

  public int onHand() {
    return onHand;
  }

  @Override
  public boolean equals(Object other) {
    if (!(other instanceof Sku)) return false;
    Sku that = (Sku) other;
    return Objects.equal(code, that.code) && onHand == that.onHand;
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(code, onHand);
  }

  @Override
  public String toString() {
    return Objects.toStringHelper(this).add("code", code).add("onHand", onHand).toString();
  }
}
