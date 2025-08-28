# Caret Document Relationship Matrix

## 📋 Document Classification System

### 🎯 Core Rule Documents (Core Rules)
- **`caretrules.ko.md`** - Project-wide principles and rules (master document)
- **`.caretrules`** - JSON rules for AI (synchronized with caretrules.ko.md)
- **`guides/ai-work-method-guide.mdx`** - AI work methodology (enhanced checkpoints)

### 🏗️ Architecture Documents (Architecture)
- **`development/caret-architecture-and-implementation-guide.mdx`** - Integrated architecture guide
- **`development/component-architecture-principles.mdx`** - Component design principles
- **`development/frontend-backend-interaction-patterns.mdx`** - Interaction patterns

### 🛠️ Development Methodology Documents (Development Methodology)
- **`development/testing-guide.mdx`** - Vitest-based TDD
- **`development/logging.mdx`** - Logging system
- **`development/internationalization.mdx`** - Multilingual support

## 🔗 Document Relationships

### **caretrules.ko.md** ↔ **ai-work-method-guide.mdx**
**Relationship**: Complementary
- caretrules.ko.md: Project-wide principles (WHAT)
- ai-work-method-guide.mdx: Specific work procedures (HOW)
- **Consistency Points**: Phase-based work, STOP POINT, TDD principles

### **caret-architecture-and-implementation-guide.mdx** → **Other Development Documents**
**Relationship**: Master → Detailed Guide
- The integrated architecture guide presents the overall structure.
- Each detailed document provides in-depth explanations for specific areas.
- **Reference Chain**: Architecture → Component → Interaction → Testing

### **frontend-backend-interaction-patterns.mdx** ↔ **component-architecture-principles.mdx**
**Relationship**: Cross-reference
- Interaction Patterns: Communication methods (gRPC, message processing)
- Component Principles: UI structure and state management
- **Common Areas**: Single field updates, Optimistic Update

### **testing-guide.mdx** → **All Implementation Documents**
**Relationship**: Quality Assurance Standard
- TDD methodology applied to all development tasks.
- RED → GREEN → REFACTOR pattern enforced.
- **Applicable to**: All areas of components, interaction, and architecture.

## 📚 Mandatory Document Matrix by Task

### **Frontend-Backend Interaction Tasks**
**Mandatory**:
1. `frontend-backend-interaction-patterns.mdx` (Primary)
2. `caret-architecture-and-implementation-guide.mdx` (Sections 10-11)
3. `message-processing-architecture.mdx`

### **Cline Original File Modification Tasks**
**Mandatory**:
1. `caretrules.ko.md` (File modification checklist)
2. `ai-work-method-guide.mdx` (STOP POINT 2)
3. Backup creation and CARET MODIFICATION comment rules

### **Component/UI Development Tasks**
**Mandatory**:
1. `component-architecture-principles.mdx` (Primary)
2. `internationalization.mdx` (Multilingual)
3. `testing-guide.mdx` (TDD)

### **Testing Related Tasks**
**Mandatory**:
1. `testing-guide.mdx` (Primary)
2. `ai-work-method-guide.mdx` (Mandatory TDD principles)
3. Architecture document for the relevant feature

### **Persona/AI Character Development Tasks**
**Mandatory**:
1. `frontend-backend-interaction-patterns.mdx` (setPersona pattern)
2. `component-architecture-principles.mdx`
3. Analysis of `caret-assets/template_characters/` structure

## 🔄 Document Synchronization Relationships

### **Automatic Synchronization**
- `caretrules.ko.md` → `.caretrules`, `.cursorrules`, `.windsurfrules`
- Script: `caret-scripts/sync-caretrules.js`

### **Manual Consistency Maintenance**
- `ai-work-method-guide.mdx` ↔ `caretrules.ko.md`
- Phase-based work, STOP POINT, AI mistake prevention principles

## 📈 Document Evolution Relationships

### **Top-Down Propagation**
1. **Project Principle Changes** (caretrules.ko.md)
   → AI work method updates (ai-work-method-guide.mdx)
   → Specific guide reflection (each development/*.mdx)

2. **Architecture Pattern Changes** (caret-architecture-and-implementation-guide.mdx)
   → Detailed implementation guide updates
   → Task document template reflection

### **Bottom-Up Feedback**
1. **Actual Implementation Experience** (task documents, development process)
   → Methodology improvement (ai-work-method-guide.mdx)
   → Rule updates (caretrules.ko.md)

## 🎯 Document Priority

### **Tier 1: Core Mandatory**
1. `caretrules.ko.md` - Overall project principles
2. `ai-work-method-guide.mdx` - AI work standard
3. `caret-architecture-and-implementation-guide.mdx` - Integrated architecture

### **Tier 2: Development Mandatory**
4. `frontend-backend-interaction-patterns.mdx`
5. `component-architecture-principles.mdx`
6. `testing-guide.mdx`

### **Tier 3: Specialized Guides**
7. `logging.mdx`
8. `internationalization.mdx`
9. `upstream-merging.mdx`

## 📝 Document Quality Standards

### **Consistency Checkpoints**
- [ ] Terminology consistency (Caret = '^' symbol, NOT carrot 🥕)
- [ ] Path accuracy (100% match with actual codebase)
- [ ] Example code functionality (all examples actually work)
- [ ] MDX format adherence (all technical documents in .mdx)

### **Relationship Verification**
- [ ] Validity of cross-reference links
- [ ] Minimization of duplicate content
- [ ] Identification of missing links
- [ ] Consistency across versions

---

**Last Update**: 2025-06-23
**Next Review Scheduled**: Upon major architecture changes
