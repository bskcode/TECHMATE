import { describe, it, expect } from 'vitest';
import { extractSyllabusFallback } from '../../lib/ai/syllabus-extractor';

describe('Syllabus & Curriculum Extractor', () => {
  const sampleSyllabus = `COURSE: CS301 - Operating Systems
Description: Principles of operating systems, process management, memory virtual memory, and storage.

Course Outcomes (COs):
CO1: Explain the role of operating systems and system calls.
CO2: Analyze CPU scheduling algorithms and process synchronization mechanisms.
CO3: Evaluate virtual memory management policies including page replacement.
CO4: Formulate file system layout strategies for persistent storage.

Course Objectives:
- Understand modern OS architectures
- Master process synchronization primitives
- Analyze disk scheduling algorithms

Module 1: Processes and CPU Scheduling
Process states, Process Control Block (PCB), context switching, preemptive and non-preemptive scheduling.
Objectives:
- Trace process state transitions
- Calculate turnaround and waiting times for Round Robin and SJF

Module 2: Concurrency & Deadlocks
Critical section problem, Peterson's algorithm, semaphores, mutex locks, Coffman conditions, Banker's algorithm.
Objectives:
- Design mutual exclusion solutions using semaphores
- Trace Banker's safety algorithm for deadlock avoidance

Module 3: Virtual Memory Management
Paging, segmentation, Translation Lookaside Buffer (TLB), page faults, FIFO and LRU page replacement.
Objectives:
- Calculate effective memory access time with TLB
- Simulate LRU and optimal page replacement policies`;

  it('extracts curriculum modules separately with titles, descriptions, and learning objectives', () => {
    const res = extractSyllabusFallback(sampleSyllabus, 'CS301', 'Operating Systems');

    expect(res.modules.length).toBe(3);

    // Module 1
    expect(res.modules[0].title).toContain('Module 1');
    expect(res.modules[0].title).toContain('Processes and CPU Scheduling');
    expect(res.modules[0].order_index).toBe(1);
    expect(res.modules[0].description).toBeDefined();
    expect(res.modules[0].learning_objectives.length).toBeGreaterThanOrEqual(1);

    // Module 2
    expect(res.modules[1].title).toContain('Module 2');
    expect(res.modules[1].title).toContain('Concurrency & Deadlocks');
    expect(res.modules[1].order_index).toBe(2);

    // Module 3
    expect(res.modules[2].title).toContain('Module 3');
    expect(res.modules[2].title).toContain('Virtual Memory Management');
    expect(res.modules[2].order_index).toBe(3);
  });

  it('extracts Course Outcomes (COs) with Bloom taxonomy cognitive mappings', () => {
    const res = extractSyllabusFallback(sampleSyllabus, 'CS301', 'Operating Systems');

    expect(res.course_outcomes.length).toBe(4);
    expect(res.course_outcomes[0].code).toBe('CO1');
    expect(res.course_outcomes[0].bloom_level).toBe('understanding');

    expect(res.course_outcomes[1].code).toBe('CO2');
    expect(res.course_outcomes[1].bloom_level).toBe('analysis');

    expect(res.course_outcomes[2].code).toBe('CO3');
    expect(res.course_outcomes[2].bloom_level).toBe('evaluation');

    expect(res.course_outcomes[3].code).toBe('CO4');
    expect(res.course_outcomes[3].bloom_level).toBe('creativity');
  });

  it('extracts high-level course learning objectives', () => {
    const res = extractSyllabusFallback(sampleSyllabus, 'CS301', 'Operating Systems');

    expect(res.learning_objectives.length).toBeGreaterThanOrEqual(2);
  });
});

