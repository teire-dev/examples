package dev.teire.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

class PickListTest {
  @Test
  void routeJoinsShelvesAndSkipsBlanks() {
    assertEquals("A1 → B4 → C2", new PickList(Arrays.asList("A1", "", "B4", "", "C2")).route());
  }

  @Test
  void shelvesAreACopy() {
    var source = new java.util.ArrayList<>(List.of("A1"));
    var list = new PickList(source);
    source.add("Z9");
    assertEquals(List.of("A1"), list.shelves());
  }

  @Test
  void emptyListIsRefused() {
    assertThrows(IllegalArgumentException.class, () -> new PickList(List.of()));
  }
}
