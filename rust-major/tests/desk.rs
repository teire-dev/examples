use desk_random::{assign, fast, follow_up_minutes, jitter_ms, seeded, shuffle_queue, ticket_id};

#[test]
fn ticket_ids_have_a_prefix_and_six_characters() {
    let mut rng = seeded(7);
    for _ in 0..100 {
        let id = ticket_id(&mut rng);
        assert!(id.starts_with("T-"), "{id}");
        assert_eq!(id.len(), 8, "{id}");
        assert!(id[2..].chars().all(|c| c.is_ascii_digit() || c.is_ascii_uppercase()), "{id}");
    }
}

#[test]
fn assignment_picks_an_agent_on_shift() {
    let mut rng = seeded(1);
    let agents = ["amara", "bayo", "chidi"];
    for _ in 0..50 {
        assert!(agents.contains(&assign(&mut rng, &agents).unwrap()));
    }
    assert_eq!(assign(&mut rng, &[]), None);
}

#[test]
fn follow_ups_stay_in_the_window() {
    let mut rng = fast(3);
    for _ in 0..200 {
        let m = follow_up_minutes(&mut rng, 30, 90);
        assert!((30..=90).contains(&m), "{m}");
    }
}

#[test]
fn jitter_adds_at_most_half() {
    for _ in 0..200 {
        let d = jitter_ms(400);
        assert!((400..=600).contains(&d), "{d}");
    }
}

#[test]
fn shuffling_keeps_every_ticket() {
    let mut rng = seeded(9);
    let mut queue: Vec<u32> = (1..=20).collect();
    shuffle_queue(&mut rng, &mut queue);
    let mut sorted = queue.clone();
    sorted.sort();
    assert_eq!(sorted, (1..=20).collect::<Vec<_>>());
}
