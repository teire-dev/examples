package dev.teire.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.google.common.util.concurrent.SettableFuture;
import java.util.List;
import org.junit.jupiter.api.Test;

class TagsTest {
  @Test
  void normalizeTrimsAndCollapses() {
    assertEquals("cold storage", Tags.normalize("  Cold \t  Storage \n"));
  }

  @Test
  void labelKeepsLettersDigitsAndSpaces() {
    assertEquals("aisle7 bin3", Tags.label(" Aisle-7 /  Bin#3 "));
  }

  @Test
  void totalOnHandWaitsForTheCount() throws Exception {
    SettableFuture<List<Sku>> count = SettableFuture.create();
    var total = Tags.totalOnHand(count);
    count.set(List.of(new Sku("A-1", 4), new Sku("B-2", 6)));
    assertEquals(10, total.get());
  }

  @Test
  void skuPrintsItsFields() {
    assertEquals("Sku{code=A-1, onHand=4}", new Sku("A-1", 4).toString());
    assertEquals(new Sku("A-1", 4), new Sku("A-1", 4));
  }
}
