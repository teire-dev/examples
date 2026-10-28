package dev.teire.demo;

import com.google.common.base.Joiner;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import java.util.List;

/** The shelves a picker visits, in order, printed for the handheld. */
public final class PickList {
  private final ImmutableList<String> shelves;

  public PickList(List<String> shelves) {
    Preconditions.checkArgument(!shelves.isEmpty(), "a pick list needs at least one shelf");
    this.shelves = ImmutableList.copyOf(shelves);
  }

  public ImmutableList<String> shelves() {
    return shelves;
  }

  /** "A1 → B4 → C2"; blank shelf names are skipped. */
  public String route() {
    return Joiner.on(" → ").join(shelves.stream().filter(s -> !Strings.isNullOrEmpty(s)).iterator());
  }
}
