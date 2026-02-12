# Demo Environment Orchestration System

> **🎪 One-Click Demo Environments for Sales, Training, and Development**

The Demo Environment Orchestration System allows administrators to instantly spin up complete, isolated instances of the Splits Network platform for demonstrations, training, and testing purposes.

## 🚀 Quick Overview

**What it does:**

- Creates temporary, fully-functional Splits Network environments
- Provisions isolated Kubernetes namespaces with all services
- Sets up dedicated Supabase databases with realistic demo data
- Provides custom subdomains for each demo instance
- Automatically cleans up resources after expiration

**Use Cases:**

- **Sales Demos**: Instant environments for prospect demonstrations
- **Training**: Clean environments for user onboarding and training
- **QA Testing**: Isolated testing environments for new features
- **Development**: Feature testing without affecting staging/production

## 📋 What You Get

Each demo instance includes:

### Applications

- **Portal App**: `https://demo-abc123.portal.splits.network`
- **Candidate App**: `https://demo-abc123.candidate.splits.network`

### Backend Services

- API Gateway with full routing
- Identity Service (Clerk integration)
- ATS Service (jobs, candidates, applications)
- Network Service (recruiters, assignments)
- Billing Service (subscriptions, payouts)
- Notification Service (email notifications)
- Document Service (file management)
- AI Service (candidate-job matching)

### Infrastructure

- Dedicated Kubernetes namespace
- Isolated Supabase database
- Redis cache instance
- RabbitMQ message broker
- Ingress with SSL termination

## ⏱️ Quick Start

### For Administrators

1. **Access Admin Panel**

    ```
    Navigate to: /portal/admin/demo-instances
    ```

2. **Create Demo Instance**
    - Click "Create Demo Environment"
    - Select demo type and duration
    - Wait ~2-3 minutes for provisioning

3. **Share Demo URLs**
    - Portal: For recruiters and company users
    - Candidate: For candidate experience demos

### For Sales Teams

1. **Request Demo Environment**
    - Contact admin or use self-service portal
    - Specify prospect requirements (agency vs enterprise)

2. **Demo Preparation**
    - Environment comes pre-seeded with realistic data
    - Multiple user personas available
    - Guided tour scripts available

3. **During Demo**
    - Show recruiter workflow
    - Demonstrate candidate experience
    - Highlight AI matching capabilities

## 📊 Demo Data Scenarios

### Recruiting Agency (Default)

- 10 open jobs across multiple companies
- 50 candidate profiles with resumes
- 25 active applications in various stages
- 3 recruiter users with different specializations
- 5 company admin users

### Enterprise Setup

- Single large company with 50+ jobs
- 200+ candidate profiles
- Complex approval workflows
- Department-based job categorization
- Advanced reporting dashboards

### Startup Scenario

- Small company with 3-5 critical roles
- 20 high-quality candidates
- Fast-moving hiring process
- Founder/CEO user persona
- Growth-stage challenges

## 🔧 Technical Architecture

See [architecture.md](./architecture.md) for detailed technical implementation.

### Core Components

1. **Demo Orchestrator Service**
    - Manages demo instance lifecycle
    - Coordinates Kubernetes and Supabase provisioning
    - Handles auto-cleanup and resource management

2. **Kubernetes Integration**
    - Dynamic namespace creation
    - Helm chart deployment
    - Resource quotas and limits
    - Network isolation policies

3. **Supabase Management**
    - Project creation via Management API
    - Schema migration automation
    - Demo data seeding
    - Automatic cleanup

## 💰 Cost Structure

| Component        | Cost/Hour | Notes                |
| ---------------- | --------- | -------------------- |
| Kubernetes Pods  | $0.10     | Small instance sizes |
| Supabase Project | $0.05     | Hobby tier           |
| Network/Storage  | $0.01     | Minimal usage        |
| **Total**        | **$0.16** | Per demo instance    |

### Typical Usage Costs

- **2-hour sales demo**: $0.32
- **8-hour training session**: $1.28
- **Monthly sales team usage** (50 demos): $16

See [cost-analysis.md](./cost-analysis.md) for detailed breakdowns.

## 🛡️ Security & Isolation

- **Complete Network Isolation**: Each demo runs in isolated Kubernetes namespace
- **Separate Databases**: Individual Supabase projects with no data sharing
- **Subdomain Isolation**: Custom domains with SSL termination
- **No Production Access**: Demos cannot access production data or services
- **Auto-Cleanup**: Automatic resource deletion prevents data persistence

See [security.md](./security.md) for security implementation details.

## 📅 Implementation Timeline

### Phase 1: Foundation (Week 1)

✅ Demo orchestrator service
✅ Basic Kubernetes deployment
✅ Manual Supabase integration
✅ Simple admin UI

### Phase 2: Automation (Week 2)

🔄 Supabase Management API integration
🔄 Automated project lifecycle
🔄 Demo data seeding

### Phase 3: Production Ready (Week 3)

⏳ Resource management and quotas
⏳ Network isolation policies
⏳ Monitoring and alerting

### Phase 4: Advanced Features (Week 4)

⏳ Multiple demo scenarios
⏳ Self-service portal for sales
⏳ Usage analytics and reporting

See [implementation-plan.md](./implementation-plan.md) for detailed implementation guide.

## 📚 Documentation Index

- **[Architecture](./architecture.md)** - Technical architecture and system design
- **[Implementation Plan](./implementation-plan.md)** - Step-by-step implementation guide
- **[Resource Management](./resource-management.md)** - Kubernetes resource handling
- **[Security](./security.md)** - Security considerations and isolation
- **[Cost Analysis](./cost-analysis.md)** - Detailed cost breakdown and optimization
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Admin UI](./admin-ui.md)** - Admin interface design and workflows

## 🚨 Limitations & Considerations

### Current Limitations

- Demo instances limited to 8 hours maximum duration
- No persistent storage (data lost on cleanup)
- Shared cluster resources (may impact performance)
- Manual Clerk configuration required

### Future Enhancements

- Self-service demo creation for sales team
- Demo templates for different industries
- Integration with CRM for prospect tracking
- Advanced analytics and usage metrics
- Automated demo scheduling and reminders

## 🤝 Contributing

To contribute to the demo orchestration system:

1. Review the [architecture documentation](./architecture.md)
2. Follow the [implementation plan](./implementation-plan.md)
3. Ensure security requirements in [security.md](./security.md) are met
4. Test cost implications using [cost analysis](./cost-analysis.md)

## 📞 Support

For issues with demo environments:

- **Admin Issues**: Check Kubernetes logs and Supabase project status
- **Performance**: Review resource quotas and cluster capacity
- **Demo Data**: Verify seeding scripts and migration status
- **Access Issues**: Check DNS and ingress configuration

---

**🎯 Vision**: Transform how we demonstrate Splits Network capabilities with instant, isolated, production-like environments that showcase our platform's power without any setup friction.
